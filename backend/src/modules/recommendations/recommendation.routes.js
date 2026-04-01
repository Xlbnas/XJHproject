const express = require('express');
const router = express.Router();
const dbModule = require('../../config/db');
const axios = require('axios');

// 请求节流机制
const requestThrottle = {
  windowMs: 1000, // 1秒
  max: 10, // 最多10个请求
  requests: new Map()
};

// 节流中间件
function throttle(req, res, next) {
  const ip = req.ip;
  const now = Date.now();
  
  if (!requestThrottle.requests.has(ip)) {
    requestThrottle.requests.set(ip, []);
  }
  
  const requests = requestThrottle.requests.get(ip);
  // 移除过期的请求
  const validRequests = requests.filter(timestamp => now - timestamp < requestThrottle.windowMs);
  requestThrottle.requests.set(ip, validRequests);
  
  if (validRequests.length >= requestThrottle.max) {
    return res.status(429).json({ error: 'Too many requests, please try again later.' });
  }
  
  // 添加当前请求
  validRequests.push(now);
  requestThrottle.requests.set(ip, validRequests);
  
  next();
};

// 从数据库获取菜单数据
function getMenuData() {
  const db = require('../../config/db').getDb();
  const stmt = db.prepare(`
    SELECT id, name, category, price, desc, image, tags, sales 
    FROM menu_items
  `);
  
  const menuData = [];
  while (stmt.step()) {
    const row = stmt.getAsObject();
    menuData.push({
      ...row,
      tags: row.tags ? row.tags.split(',') : []
    });
  }
  
  return menuData;
}

// 自然语言处理函数（基于规则）
function processNaturalLanguage(query) {
  // 常见的菜品关键词映射
  const keywordMap = {
    'spicy': ['spicy', 'hot', 'fiery', 'chili'],
    'chicken': ['chicken', 'poultry', 'bird'],
    'beef': ['beef', 'steak', 'meat'],
    'pork': ['pork', 'bacon', 'ham'],
    'fish': ['fish', 'seafood', 'ocean'],
    'vegetarian': ['vegetarian', 'veggie', 'plant-based'],
    'healthy': ['healthy', 'light', 'fresh'],
    'sweet': ['sweet', 'dessert', 'sugar'],
    'sour': ['sour', 'tangy', 'lemony'],
    'cheap': ['cheap', 'affordable', 'budget'],
    'expensive': ['expensive', 'premium', 'luxury']
  };
  
  const lowercaseQuery = query.toLowerCase();
  const keywords = [];
  
  // 提取关键词
  for (const [key, synonyms] of Object.entries(keywordMap)) {
    if (synonyms.some(synonym => lowercaseQuery.includes(synonym))) {
      keywords.push(key);
    }
  }
  
  // 提取具体菜品名称
  const dishNames = ['kung pao', 'mapo tofu', 'sweet and sour', 'braised pork', 'steamed sea bass', 'garlic broccoli'];
  for (const dishName of dishNames) {
    if (lowercaseQuery.includes(dishName)) {
      keywords.push(dishName);
    }
  }
  
  return keywords.length > 0 ? keywords.join(',') : null;
}

// AI模型调用函数（作为备选）
async function getAIInsights(query) {
  try {
    // 尝试使用SiliconFlow API
    const response = await axios.post('https://api.siliconflow.cn/v1/chat/completions', {
      model: 'gpt-4', // 尝试使用gpt-4模型
      messages: [
        {
          role: 'system',
          content: 'You are a restaurant recommendation assistant. Analyze the user\'s request and identify key food preferences such as cuisine type, ingredients, spice level, price range, and any other relevant factors. Return only the keywords separated by commas.'
        },
        {
          role: 'user',
          content: query
        }
      ],
      max_tokens: 50
    }, {
      headers: {
        'Authorization': 'Bearer sk-sbnzgsabgpixukfohctlvdgvmwedjjlcuaoomdvitajxfuak',
        'Content-Type': 'application/json'
      }
    });
    
    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI model error:', error);
    // 失败时使用基于规则的自然语言处理
    return processNaturalLanguage(query);
  }
}

// 推荐API端点
router.get('/recommend', throttle, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.json({ suggestions: [] });
    }
    
    let keywords = [query.toLowerCase()];
    
    // 尝试使用AI模型获取更多关键词
    const aiInsights = await getAIInsights(query);
    if (aiInsights) {
      keywords = aiInsights.split(',').map(keyword => keyword.trim().toLowerCase()).filter(Boolean);
    }
    
    // 从数据库获取菜单数据
    const menuData = getMenuData();
    
    // 关键词匹配并计算相关性得分
    const suggestions = menuData
      .map(item => {
        const itemLower = item.name.toLowerCase();
        const descLower = item.desc.toLowerCase();
        const tagLowers = item.tags.map(tag => tag.toLowerCase());
        
        // 计算匹配得分
        let score = 0;
        keywords.forEach(keyword => {
          if (itemLower.includes(keyword)) score += 3; // 菜名匹配权重最高
          if (descLower.includes(keyword)) score += 2; // 描述匹配权重次之
          if (tagLowers.some(tag => tag.includes(keyword))) score += 1; // 标签匹配权重最低
        });
        
        // 添加流行度得分（基于销量）
        const popularityScore = item.sales / 200; // 标准化销量得分
        score += popularityScore;
        
        return {
          item,
          score,
          reason: aiInsights ? 'AI recommendation' : 'Match found'
        };
      })
      .filter(item => item.score > 0) // 只保留有匹配的项
      .sort((a, b) => b.score - a.score) // 按得分降序排序
      .slice(0, 6) // 只返回前6个
      .map(({ item, reason }) => ({
        item,
        reason
      }));
    
    res.json({ suggestions });
  } catch (error) {
    console.error('Recommendation error:', error);
    
    // 失败时使用数据库关键词匹配
    const { query } = req.query;
    if (query && query.trim() !== '') {
      const lowercaseQuery = query.toLowerCase();
      const menuData = getMenuData();
      const suggestions = menuData
        .filter(item => 
          item.name.toLowerCase().includes(lowercaseQuery) ||
          item.desc.toLowerCase().includes(lowercaseQuery) ||
          item.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        )
        .slice(0, 6)
        .map(item => ({
          item,
          reason: 'Match found'
        }));
      
      res.json({ suggestions });
    } else {
      res.json({ suggestions: [] });
    }
  }
});

module.exports = router;
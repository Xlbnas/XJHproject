// 测试推荐算法
const query = 'chicken';
const keywords = [query.toLowerCase()];

// 模拟数据库返回的菜单数据
const menuData = [
  { id: 1, name: 'Kung Pao Chicken', category: 'Mains', price: 38, desc: 'Classic Sichuan dish — tender chicken with crunchy peanuts', image: 'https://images.unsplash.com/photo-1604908176997-1251884b08a5?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Chicken', 'Hearty'], sales: 186 },
  { id: 2, name: 'Mapo Tofu', category: 'Mains', price: 32, desc: 'Soft tofu in spicy Sichuan sauce with minced meat', image: 'https://images.unsplash.com/photo-1563245372-f7216b524901?auto=format&fit=crop&w=800&q=80', tags: ['Spicy', 'Sichuan', 'Tofu', 'Vegetarian'], sales: 152 }
];

console.log('Keywords:', keywords);
console.log('\nMenu Data:');
menuData.forEach(item => {
  console.log(`\nItem: ${item.name}`);
  console.log(`  Tags: ${JSON.stringify(item.tags)}`);
  
  const itemLower = item.name.toLowerCase();
  const descLower = item.desc.toLowerCase();
  const tagLowers = item.tags.map(tag => tag.toLowerCase());
  
  console.log(`  itemLower: ${itemLower}`);
  console.log(`  descLower: ${descLower}`);
  console.log(`  tagLowers: ${JSON.stringify(tagLowers)}`);
  
  let matchScore = 0;
  let matchedReason = '';
  
  keywords.forEach(keyword => {
    const keywordLower = keyword.toLowerCase().trim();
    console.log(`  Checking keyword: "${keywordLower}"`);
    
    if (keywordLower.length < 2) {
      console.log('    -> Too short, skipping');
      return;
    }
    
    // 菜名匹配权重最高
    if (itemLower.includes(keywordLower)) {
      matchScore += 3;
      matchedReason = 'Name match';
      console.log('    -> Name match! score += 3');
    }
    // 描述匹配权重次之
    else if (descLower.includes(keywordLower)) {
      matchScore += 2;
      matchedReason = 'Description match';
      console.log('    -> Description match! score += 2');
    }
    // 标签匹配权重最低，使用包含匹配（不区分大小写）
    else if (tagLowers.some(tag => tag.toLowerCase().includes(keywordLower))) {
      matchScore += 1;
      matchedReason = 'Tag match';
      console.log('    -> Tag match! score += 1');
    } else {
      console.log('    -> No match');
    }
  });
  
  console.log(`  Final matchScore: ${matchScore}, reason: ${matchedReason}`);
});

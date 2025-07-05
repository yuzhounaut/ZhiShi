export interface PlantFamily {
  id: string;
  chineseName: string;
  latinName: string;
  description: string;
  characteristics: string[];
  commonSpecies: string[];
  images: string[];
  traits: {
    growth: string[];
    leaf: string[];
    flower: string[];
    fruit: string[];
  };
}

export interface PlantTrait {
  id: string;
  category: string;
  name: string;
  description: string;
}

export const plantTraits: PlantTrait[] = [
  // 生长习性
  { id: 'herb', category: '生长习性', name: '草本', description: '茎部柔软，通常一年生或多年生' },
  { id: 'shrub', category: '生长习性', name: '灌木', description: '木质茎，但相对较低，多分枝' },
  { id: 'tree', category: '生长习性', name: '乔木', description: '高大的木质植物，有明显主干' },
  { id: 'vine', category: '生长习性', name: '藤本', description: '茎部细长，需要依附其他物体生长' },
  
  // 叶特征
  { id: 'alternate', category: '叶特征', name: '叶互生', description: '叶子在茎上交替排列' },
  { id: 'opposite', category: '叶特征', name: '叶对生', description: '叶子在茎上相对排列' },
  { id: 'whorled', category: '叶特征', name: '叶轮生', description: '三片或更多叶子在同一节点排列' },
  { id: 'simple', category: '叶特征', name: '单叶', description: '叶片完整，不分裂' },
  { id: 'compound', category: '叶特征', name: '复叶', description: '叶片分裂成多个小叶' },
  
  // 花特征
  { id: 'radial', category: '花特征', name: '辐射对称', description: '花朵呈辐射状对称' },
  { id: 'bilateral', category: '花特征', name: '两侧对称', description: '花朵左右对称' },
  { id: 'labiate', category: '花特征', name: '唇形花冠', description: '花冠呈唇形，上下唇明显' },
  { id: 'tubular', category: '花特征', name: '管状花冠', description: '花冠呈管状' },
  { id: 'cruciform', category: '花特征', name: '十字形花冠', description: '四个花瓣呈十字形排列' },
  
  // 果实特征
  { id: 'berry', category: '果实特征', name: '浆果', description: '果实多汁，种子包埋在果肉中' },
  { id: 'capsule', category: '果实特征', name: '蒴果', description: '干燥果实，成熟时开裂释放种子' },
  { id: 'achene', category: '果实特征', name: '瘦果', description: '小型干燥果实，通常单种子' },
  { id: 'legume', category: '果实特征', name: '荚果', description: '豆类特有果实，沿腹缝和背缝开裂' },
];

export const plantFamilies: PlantFamily[] = [
  {
    id: 'rosaceae',
    chineseName: '蔷薇科',
    latinName: 'Rosaceae',
    description: '蔷薇科是被子植物中的大科之一，包含多种经济植物如苹果、梨、桃等。',
    characteristics: [
      '花通常5数，花瓣5片',
      '雄蕊多数，常为花瓣数的倍数',
      '心皮1至多数，离生或合生',
      '叶多互生，有托叶'
    ],
    commonSpecies: ['玫瑰', '苹果', '樱花', '草莓', '山楂'],
    images: ['/images/rosaceae_1.jpg', '/images/rosaceae_2.jpg'],
    traits: {
      growth: ['灌木', '乔木'],
      leaf: ['叶互生', '单叶', '复叶'],
      flower: ['辐射对称'],
      fruit: ['浆果', '蒴果']
    }
  },
  {
    id: 'leguminosae',
    chineseName: '豆科',
    latinName: 'Leguminosae',
    description: '豆科是植物界第三大科，具有固氮能力，对生态系统具有重要意义。',
    characteristics: [
      '花冠蝶形，由旗瓣、翼瓣和龙骨瓣组成',
      '雄蕊10枚，常为二体雄蕊',
      '果实为荚果',
      '根部常有根瘤菌共生'
    ],
    commonSpecies: ['大豆', '豌豆', '槐树', '紫荆', '合欢'],
    images: ['/images/leguminosae_1.jpg', '/images/leguminosae_2.jpg'],
    traits: {
      growth: ['草本', '灌木', '乔木'],
      leaf: ['叶互生', '复叶'],
      flower: ['两侧对称'],
      fruit: ['荚果']
    }
  },
  {
    id: 'compositae',
    chineseName: '菊科',
    latinName: 'Compositae',
    description: '菊科是被子植物中最大的科之一，花序为头状花序，是其显著特征。',
    characteristics: [
      '头状花序，由多数小花组成',
      '花冠管状或舌状',
      '雄蕊5枚，聚药',
      '果实为瘦果，常有冠毛'
    ],
    commonSpecies: ['菊花', '向日葵', '蒲公英', '雏菊', '艾草'],
    images: ['/images/compositae_1.jpg', '/images/compositae_2.jpg'],
    traits: {
      growth: ['草本'],
      leaf: ['叶互生', '叶对生'],
      flower: ['辐射对称', '管状花冠'],
      fruit: ['瘦果']
    }
  },
  {
    id: 'labiatae',
    chineseName: '唇形科',
    latinName: 'Labiatae',
    description: '唇形科植物多含芳香油，茎常呈四棱形，花冠二唇形是其典型特征。',
    characteristics: [
      '茎常四棱形',
      '叶对生',
      '花冠二唇形',
      '雄蕊4枚，二强雄蕊'
    ],
    commonSpecies: ['薄荷', '薰衣草', '迷迭香', '鼠尾草', '丹参'],
    images: ['/images/labiatae_1.jpg', '/images/labiatae_2.jpg'],
    traits: {
      growth: ['草本'],
      leaf: ['叶对生', '单叶'],
      flower: ['两侧对称', '唇形花冠'],
      fruit: ['瘦果']
    }
  },
  {
    id: 'cruciferae',
    chineseName: '十字花科',
    latinName: 'Cruciferae',
    description: '十字花科因其四片花瓣呈十字形排列而得名，包含许多重要的蔬菜作物。',
    characteristics: [
      '花瓣4片，呈十字形排列',
      '雄蕊6枚，四长二短',
      '果实为角果',
      '叶多互生'
    ],
    commonSpecies: ['白菜', '萝卜', '芥菜', '油菜', '紫甘蓝'],
    images: ['/images/cruciferae_1.jpg', '/images/cruciferae_2.jpg'],
    traits: {
      growth: ['草本'],
      leaf: ['叶互生', '单叶'],
      flower: ['辐射对称', '十字形花冠'],
      fruit: ['蒴果']
    }
  },
  {
    id: 'solanaceae',
    chineseName: '茄科',
    latinName: 'Solanaceae',
    description: '茄科包含许多重要的经济植物，如番茄、马铃薯等，部分植物含有生物碱。',
    characteristics: [
      '花冠合瓣，通常5裂',
      '雄蕊5枚，着生于花冠筒上',
      '果实为浆果或蒴果',
      '叶多互生'
    ],
    commonSpecies: ['番茄', '马铃薯', '茄子', '辣椒', '烟草'],
    images: ['/images/solanaceae_1.jpg', '/images/solanaceae_2.jpg'],
    traits: {
      growth: ['草本'],
      leaf: ['叶互生', '单叶'],
      flower: ['辐射对称', '管状花冠'],
      fruit: ['浆果']
    }
  }
];

export const quizQuestions = [
  {
    id: '1',
    familyId: 'rosaceae',
    image: '/images/quiz/rose_question.jpg',
    correctAnswers: ['5片花瓣', '雄蕊多数', '有托叶'],
    hint: '观察花瓣数量和雄蕊特征',
    explanation: '蔷薇科植物通常具有5片花瓣，雄蕊多数，叶片多有托叶。'
  },
  {
    id: '2',
    familyId: 'leguminosae',
    image: '/images/quiz/bean_question.jpg',
    correctAnswers: ['蝶形花冠', '荚果', '复叶'],
    hint: '注意花冠形态和果实类型',
    explanation: '豆科植物具有特殊的蝶形花冠，果实为荚果，叶片多为复叶。'
  },
  {
    id: '3',
    familyId: 'compositae',
    image: '/images/quiz/sunflower_question.jpg',
    correctAnswers: ['头状花序', '聚药雄蕊', '瘦果'],
    hint: '观察花序类型和果实特征',
    explanation: '菊科植物的特征是头状花序，雄蕊聚药，果实为瘦果。'
  }
];
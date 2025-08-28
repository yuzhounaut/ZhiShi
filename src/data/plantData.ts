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
    root: string[];
    stem: string[];
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
  { id: 'drupe', category: '果实特征', name: '核果', description: '外果皮薄，中果皮肉质，内果皮坚硬' },
  { id: 'pome', category: '果实特征', name: '梨果', description: '花托发育而成的肉质果实，如苹果' },
  { id: 'silique', category: '果实特征', name: '角果', description: '十字花科特有的果实类型' },
  { id: 'caryopsis', category: '果实特征', name: '颖果', description: '禾本科特有的果实，果皮与种皮合生' },

  // 根特征
  { id: 'taproot', category: '根特征', name: '主根系', description: '有明显的主根和侧根' },
  { id: 'fibrous', category: '根特征', name: '须根系', description: '没有明显主根，由许多不定根组成' },
  { id: 'nodule', category: '根特征', name: '根瘤', description: '豆科植物根部与根瘤菌共生形成的结构' },
  { id: 'bulb', category: '根特征', name: '鳞茎', description: '地下变态茎，储存养分，如洋葱' },
  { id: 'rhizome', category: '根特征', name: '根状茎', description: '地下的根状变态茎，如姜' },

  // 茎特征
  { id: 'woody', category: '茎特征', name: '木质茎', description: '茎部坚硬，木质化' },
  { id: 'herbaceous', category: '茎特征', name: '草质茎', description: '茎部柔软，非木质' },
  { id: 'square_stem', category: '茎特征', name: '方茎', description: '茎的横切面为四方形' },
  { id: 'angular_stem', category: '茎特征', name: '四棱茎', description: '茎有四条棱' },
  { id: 'erect_stem', category: '茎特征', name: '直立茎', description: '茎干垂直向上生长' },
  { id: 'hollow_stem', category: '茎特征', name: '茎中空', description: '茎的内部是空心的' },
  { id: 'jointed_stem', category: '茎特征', name: '有节', description: '茎上有明显的节' },

  // 新增叶特征
  { id: 'parallel_veins', category: '叶特征', name: '叶平行脉', description: '叶脉大致相互平行，多见于单子叶植物' },
  { id: 'leaf_sheath', category: '叶特征', name: '叶鞘', description: '叶基部包围茎的部分' },
  { id: 'ligule', category: '叶特征', name: '叶舌', description: '位于叶片和叶鞘连接处的膜质结构' },

  // 新增花特征
  { id: 'ligulate_corolla', category: '花特征', name: '舌状花冠', description: '花冠的一部分伸出呈舌状' },
  { id: 'spikelet', category: '花特征', name: '小穗', description: '禾本科植物的基本花序单位' }
];

// --- New Data for Module 4: Morphology Image Quiz ---

export interface MorphologyQuizItem {
  id: string;
  term: string;
  imageUrl: string;
  description: string;
}

export const morphologyQuizData: MorphologyQuizItem[] = [
  {
    id: 'square-stem',
    term: '方茎',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=方茎',
    description: '唇形科植物的典型特征，茎的横切面呈四方形。'
  },
  {
    id: 'ligulate-corolla',
    term: '舌状花冠',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=舌状花冠',
    description: '菊科植物中常见，部分花瓣延长呈舌头状。'
  },
  {
    id: 'cruciform-corolla',
    term: '十字形花冠',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=十字形花冠',
    description: '十字花科的标志，四片花瓣呈十字对称排列。'
  },
  {
    id: 'fibrous-roots',
    term: '须根系',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=须根系',
    description: '没有明显主根，由许多粗细相似的不定根组成，常见于单子叶植物。'
  },
  {
    id: 'taproot-system',
    term: '主根系',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=主根系',
    description: '有明显、发达的主根，主根上生出侧根，常见于双子叶植物。'
  },
  {
    id: 'compound-leaf',
    term: '复叶',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=复叶',
    description: '叶片完全分裂成多个独立的小叶。'
  },
  {
    id: 'legume-fruit',
    term: '荚果',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=荚果',
    description: '豆科植物特有的果实，由单心皮发育而成，成熟后沿背缝和腹缝开裂。'
  },
  {
    id: 'rhizome',
    term: '根状茎',
    imageUrl: 'https://placehold.co/400x300/e2e8f0/64748b?text=根状茎',
    description: '一种横向生长的地下变态茎，有明显的节和节间，如姜。'
  }
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
      root: ['主根系'],
      stem: ['木质茎'],
      leaf: ['叶互生', '单叶', '复叶'],
      flower: ['辐射对称'],
      fruit: ['浆果', '蒴果', '核果', '梨果']
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
      root: ['主根系', '根瘤'],
      stem: ['草质茎', '木质茎'],
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
      root: ['主根系'],
      stem: ['草质茎'],
      leaf: ['叶互生', '叶对生'],
      flower: ['辐射对称', '管状花冠', '舌状花冠'],
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
      root: ['须根系'],
      stem: ['方茎', '四棱茎'],
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
      root: ['主根系'],
      stem: ['草质茎'],
      leaf: ['叶互生', '单叶'],
      flower: ['辐射对称', '十字形花冠'],
      fruit: ['角果']
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
      root: ['主根系'],
      stem: ['草质茎'],
      leaf: ['叶互生', '单叶'],
      flower: ['辐射对称', '管状花冠'],
      fruit: ['浆果']
    }
  },
  {
    id: 'liliaceae',
    chineseName: '百合科',
    latinName: 'Liliaceae',
    description: '百合科是单子叶植物中的大科，多为多年生草本，具根状茎、鳞茎或块茎。',
    characteristics: [
      '花基数常为3',
      '花被片6枚，2轮排列',
      '雄蕊6枚',
      '子房上位'
    ],
    commonSpecies: ['百合', '郁金香', '贝母', '黄精'],
    images: ['/images/liliaceae_1.jpg', '/images/liliaceae_2.jpg'],
    traits: {
      growth: ['草本'],
      root: ['须根系', '鳞茎', '根状茎'],
      stem: ['直立茎'],
      leaf: ['单叶', '叶平行脉'],
      flower: ['辐射对称'],
      fruit: ['蒴果', '浆果']
    }
  },
  {
    id: 'gramineae',
    chineseName: '禾本科',
    latinName: 'Gramineae (Poaceae)',
    description: '禾本科是单子叶植物中最重要的科之一，包括了世界上大部分的粮食作物。',
    characteristics: [
      '茎有节和节间，节间中空',
      '叶鞘开裂，有叶舌',
      '花序为小穗',
      '果实为颖果'
    ],
    commonSpecies: ['水稻', '小麦', '玉米', '竹子', '高粱'],
    images: ['/images/gramineae_1.jpg', '/images/gramineae_2.jpg'],
    traits: {
      growth: ['草本'],
      root: ['须根系'],
      stem: ['茎中空', '有节'],
      leaf: ['单叶', '叶鞘', '叶舌'],
      flower: ['小穗'],
      fruit: ['颖果']
    }
  }
];

// --- New Quiz Question Data Structure and Examples ---

export interface QuizQuestion {
  familyId: string; // Corresponds to PlantFamily id
  questionId: string; // Unique ID for the question
  prompt: string; // The question text presented to the user
  targetFeatureCategory: string; // e.g., "叶", "花", "果实", "茎" - helps guide the user
  acceptableKeywords: string[]; // Array of correct keyword answers (case-insensitive)
  points: number; // Points awarded for a correct answer
  imageUrl?: string; // Optional image URL for the question
}

export const quizQuestions: QuizQuestion[] = [
  {
    familyId: "rosaceae",
    questionId: "rosaceae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["5", "杏", "五", "梨果", "桃", "核果", "聚合果", "苹果", "蔷薇果"],
    points: 20,
  },
  {
    familyId: "leguminosae",
    questionId: "leguminosae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["三出复叶", "复叶", "荚果", "掌状复叶", "羽状复叶"],
    points: 25,
  },
  {
    familyId: "compositae",
    questionId: "compositae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["头状", "头状花序", "瘦果"],
    points: 25,
  },
  {
    familyId: "labiatae",
    questionId: "labiatae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["二唇形", "唇形", "方茎", "四棱", "四棱形"],
    points: 20,
  },
  {
    familyId: "cruciferae",
    questionId: "cruciferae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["4", "十字", "十字形", "四"],
    points: 10,
  },
  {
    familyId: "solanaceae",
    questionId: "solanaceae_consolidated",
    prompt: "请列出 该科 植物的主要识别特征。",
    targetFeatureCategory: "综合特征",
    acceptableKeywords: ["增大", "宿存", "宿存并增大", "浆果", "蒴果"],
    points: 20,
  }
];
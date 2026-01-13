
export const dimensions = [
  {label: '体系功能', value: '体系功能'},
  {label: '性能准确度', value: '性能准确度'},
  {label: '想定合理性', value: '想定合理性'},
  {label: '软件质量', value: '软件质量'},
  {label: '支持智能决策', value: '支持智能决策'},
]

export const weightGroup = [
  {label: '综合权值融合', value: '1'},
  {label: '主观权值', value: '2'},
  {label: '客观权值', value: '3'},
]

// 仿真数据
export const variables = [
  /* 仿真颗粒度 */
  {
    label: "体系功能", variables: [
      {label: '飞行模型颗粒度', value: '飞行模型颗粒度'},
      {label: '雷达模型颗粒度', value: '雷达模型颗粒度'},
      {label: '导弹模型颗粒度', value: '导弹模型颗粒度'},
    ]
  },
  {
    label: "性能准确度", variables: [
      {label: '最大平飞速度 (Mach)', value: '最大平飞速度 (Mach)'},
      {label: '水平加速度 (m/s²)', value: '水平加速度 (m/s²)'},
      {label: '耗油率 (g/kWh)', value: '耗油率 (g/kWh)'},
      {label: '最大过载 (g)', value: '最大过载 (g)'},
      {label: '射程 (km)', value: '射程 (km)'},
      {label: '探测距离 (km)', value: '探测距离 (km)'},
      {label: '探测范围 (°)', value: '探测范围 (°)'},
      {label: '导引头截获距离 (km)', value: '导引头截获距离 (km)'},
      {label: '杀伤范围 (m)', value: '杀伤范围 (m)'},
    ]
  },
  {
    label: "想定合理性", variables: [
      {label: '初始距离 (km)', value: '初始距离 (km)'},
      {label: '初始挂载 (枚)', value: '初始挂载 (枚)'},
      {label: '初始油量 (kg)', value: '初始油量 (kg)'},
      {label: '初始进入角 (°)', value: '初始进入角 (°)'},
      {label: '目标/友机数量', value: '目标/友机数量'},
      {label: '目标型号', value: '目标型号'},
      {label: '初始任务', value: '初始任务'},
    ]
  },
  {
    "软件质量": []
  },
  {
    "支持智能决策": []
  },
];

export const variableValues = [

  /* 仿真颗粒度 */
  {
    label: '飞行模型颗粒度', values: [
      {label: '高保真模型', value: '1'},
      {label: '中等保真度模型', value: '2'}
    ]
  },
  {
    label: '雷达模型颗粒度', values: [
      {label: '高保真模型', value: '1'},
      {label: '中等保真度模型', value: '2'}
    ]
  },
  {
    label: '导弹模型颗粒度', values: [
      {label: '高保真模型', value: '1'},
      {label: '中等保真度模型', value: '2'}
    ]
  },

  /* 性能指标 */
  {
    label: '最大平飞速度 (Mach)', values: [
      {label: '1.2', value: '1.2'},
      {label: '1.6', value: '1.6'},
      {label: '2.0', value: '2.0'},
      {label: '2.4', value: '2.4'},
      {label: '3.0', value: '3.0'}
    ]
  },
  {
    label: '初始任务', values: [
      {label: '中远距', value: '中远距'},
      {label: '近距', value: '近距'}
    ]
  },
  {
    label: '目标型号', values: [
      {label: 'F16', value: 'F16'},
      {label: 'F35', value: 'F35'}
    ]
  },
  {
    label: '目标/友机数量', values: [
      {label: '1', value: '1'},
      {label: '2', value: '2'},
      {label: '4', value: '4'}
    ]
  },
  {
    label: '初始进入角 (°)', values: [
      {label: '0', value: '0'},
      {label: '90', value: '90'},
      {label: '180', value: '180'}
    ]
  },
  {
    label: '初始油量 (kg)', values: [
      {label: '2000', value: '2000'},
      {label: '3000', value: '3000'},
      {label: '4000', value: '4000'}
    ]
  },
  {
    label: '初始挂载 (枚)', values: [
      {label: '2', value: '2'},
      {label: '3', value: '3'},
      {label: '4', value: '4'},
      {label: '5', value: '5'},
      {label: '6', value: '6'}
    ]
  },
  {
    label: '初始距离 (km)', values: [
      {label: '120', value: '120'},
      {label: '140', value: '140'},
      {label: '160', value: '160'},
      {label: '180', value: '180'},
      {label: '200', value: '200'}
    ]
  },
  {
    label: '杀伤范围 (m)', values: [
      {label: '5', value: '5'},
      {label: '10', value: '10'},
      {label: '15', value: '15'},
      {label: '20', value: '20'},
      {label: '25', value: '25'}
    ]
  },
  {
    label: '导引头截获距离 (km)', values: [
      {label: '20', value: '20'},
      {label: '30', value: '30'},
      {label: '40', value: '40'},
      {label: '50', value: '50'}
    ]
  },
  {
    label: '射程 (km)', values: [
      {label: '40', value: '40'},
      {label: '80', value: '80'},
      {label: '120', value: '120'},
      {label: '160', value: '160'},
      {label: '200', value: '200'}
    ]
  },
  {
    label: '探测范围 (°)', values: [
      {label: '30', value: '30'},
      {label: '60', value: '60'},
      {label: '90', value: '90'}
    ]
  },
  {
    label: '探测距离 (km)', values: [
      {label: '80', value: '80'},
      {label: '100', value: '100'},
      {label: '120', value: '120'},
      {label: '140', value: '140'},
      {label: '160', value: '160'}
    ]
  },
  {
    label: '最大过载 (g)', values: [
      {label: '6', value: '6'},
      {label: '7.5', value: '7.5'},
      {label: '9', value: '9'},
      {label: '10.5', value: '10.5'},
      {label: '12', value: '12'}
    ]
  },
  {
    label: '加速度 (m/s²)', values: [
      {label: '30', value: '30'},
      {label: '40', value: '40'},
      {label: '50', value: '50'},
      {label: '60', value: '60'},
      {label: '70', value: '70'}
    ]
  },
  {
    label: '耗油率 (g/kWh)', values: [
      {label: '10', value: '10'},
      {label: '15', value: '15'},
      {label: '20', value: '20'}
    ]
  },
  {
    "射程": [
      {label: '40', value: '40'},
      {label: '80', value: '80'},
      {label: '120', value: '120'},
      {label: '160', value: '160'},
      {label: '200', value: '200'}
    ]
  }
]

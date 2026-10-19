export interface Experience {
  organization: string;
  role: string;
  location: string;
  dates: string;
  url?: string;
  summary: string;
  details: string[];
}
export const research: Experience[] = [
  {
    organization: "Distributed Systems & Storage Laboratory, Virginia Tech",
    url: "https://dssl.cs.vt.edu/",
    role: "Graduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "Aug 2026 – Present",
    summary:
      "Developing optimizers and distributed systems for more efficient transformer training.",
    details: [
      "Investigating higher-order optimization techniques for transformer training to improve convergence and training efficiency beyond first-order optimizers such as AdamW.",
      "Designing federated self-learning agent systems that let clients contribute, consolidate, and reuse learned capabilities, with attention to coordination, scalability, and safe knowledge sharing.",
      "Exploring systems and compiler techniques for training and serving Mixture-of-Experts models on specialized accelerators, including computation placement, communication, and heterogeneous execution.",
    ],
  },
  {
    organization: "Synergy Lab, Virginia Tech",
    url: "https://synergy.cs.vt.edu/",
    role: "Graduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "Mar 2022 – Jul 2026",
    summary:
      "Scaled genomic analysis on supercomputers and adapted scientific workloads for edge devices.",
    details: [
      "Studied SparkLeBLAST scalability on A64FX systems and worked with RIKEN collaborators on data layout, vectorization, and format-conversion bottlenecks.",
      "Explored Apache Arrow and Arrow Flight for genomic analysis pipelines; contributed to low-dose chest CT enhancement work using 3D-DDNet and VGG-based models.",
      "Implemented power-of-two FFTs for large sets of sequences, each of length 8192, on Raspberry Pi 5 edge devices using an OpenCL-based, write-once-run-anywhere pipeline.",
    ],
  },
  {
    organization: "InfoVis Lab, Virginia Tech",
    url: "https://infovis.cs.vt.edu/content/home",
    role: "Undergraduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "May 2021 – May 2022",
    summary:
      "Built tools for researchers to guide how machine learning models group and sort images.",
    details: [
      "Worked on Andromeda features for exploratory sorting of edamame seed images.",
      "Built tools for clustering images using domain feedback and pretrained VGG-16 and ResNet projections; tuned feature-space distance weights from user-driven projections to improve sorting accuracy.",
    ],
  },
  {
    organization: "Crawford Lab, Virginia Tech",
    url: "https://crawford.chem.vt.edu/",
    role: "Undergraduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "Jan 2020 – May 2022",
    summary:
      "Used numerical methods and machine learning to reduce the cost of quantum chemistry simulations.",
    details: [
      "Worked on localized orbital spaces, mixed-precision arithmetic, GPU utilization, and machine learning for real-time coupled-cluster calculations.",
      "Used the Pade approximant method to reduce simulation time for accurate results from about 2000 atomic units to about 200; developed signal-analysis and LSTM forecasting routines.",
    ],
  },
];
export const internships: Experience[] = [
  {
    organization: "Oak Ridge National Laboratory",
    url: "https://www.ornl.gov/",
    role: "Student Intern",
    location: "Oak Ridge, Tennessee",
    dates: "May 2026 – Aug 2026",
    summary:
      "Developed distributed higher-order optimizers for transformer training in Megatron-LM.",
    details: [
      "Investigated higher-order optimization methods as alternatives to first-order optimizers such as AdamW, and developed distributed optimizer support for NVIDIA’s Megatron-LM tensor-parallel framework.",
      "Addressed numerical, communication, and memory challenges in scaling optimizer computations beyond a single GPU’s capacity.",
      "Implemented and evaluated multi-GPU prototypes on leadership-class computing systems, with results being prepared for publication.",
    ],
  },
  {
    organization: "Oak Ridge National Laboratory",
    url: "https://www.ornl.gov/",
    role: "Student Intern",
    location: "Oak Ridge, Tennessee",
    dates: "May 2025 – Aug 2025",
    summary:
      "Built and tuned GPU kernels for fused matrix operations on NVIDIA GPUs.",
    details: [
      "Built tiled GEMM kernels in CUDA and a profiling harness for GPU memory hierarchy, occupancy, and warp scheduling experiments.",
      "Used Triton to implement and tune fused GEMM+SiLU kernels, reaching roughly 1.2-1.35x single-precision speedups over a PyTorch baseline on Ampere and Hopper GPUs.",
      "Prototyped a full SwiGLU fusion in CUTLASS with a Python-callable C++ kernel interface.",
    ],
  },
  {
    organization: "RIKEN Center for Computational Science",
    url: "https://www.r-ccs.riken.jp/en/about/",
    role: "Student Research Intern",
    location: "Tokyo, Japan",
    dates: "Oct 2024 – Dec 2024",
    summary:
      "Developed search algorithms to find combinations of genetic mutations associated with cancer.",
    details: [
      "Worked on algorithms for identifying multi-hit genetic mutation combinations associated with specific cancer types.",
      "Implemented a sparsity-aware weighted set-cover approach to reduce the mutation-combination search space and prepare for large runs on Fugaku.",
    ],
  },
  {
    organization: "Amazon Web Services",
    role: "Software Development Engineer Intern",
    location: "Boston, Massachusetts",
    dates: "May 2022 – Aug 2022",
    summary:
      "Built tools to track indexing progress across millions of IoT devices.",
    details: [
      "Worked on indexing and querying workflows for millions of IoT devices across multiple databases.",
      "Built a tracking feature for indexing progress, wrote status data into Elasticsearch, and used AWS CloudWatch for backfill metrics.",
    ],
  },
];

export const education = [
  {
    degree: "PhD in Computer Science",
    date: "Expected May 2028",
    gpa: "3.75",
    details:
      "Research areas: High-Performance Computing, Numerical Optimization, and Transformer Models.",
  },
  {
    degree: "MS in Computer Science",
    date: "Jul 2026",
    gpa: "3.75",
    details:
      "Thesis: Sparsity-Driven Search for Multi-Hit Genetic Mutation Combinations in Cancer.",
  },
  {
    degree: "BS in Computer Science",
    date: "May 2023",
    gpa: "3.74",
    details: "",
  },
  {
    degree: "BS in Computational Modeling & Data Analytics",
    date: "May 2023",
    details: "Minor: Mathematics",
  },
];

export const honors = [
  {
    title: "Pratt Fellowship",
    date: "2025–26",
    description:
      "Awarded for academic excellence and demonstrated research potential within the College of Engineering at Virginia Tech.",
  },
  {
    title: "Outstanding Master’s Student Award Nomination",
    date: "",
    description:
      "Nominated by the Computer Science Department as its representative for the College of Engineering’s Best Master’s Student Award.",
  },
  {
    title: "Outstanding Student Paper Award",
    date: "2024",
    description:
      "IEEE HPEC, for “Analyzing Scalable Genomic Diversity Study using SparkLeBLAST: A Feasibility Study.”",
  },
  {
    title: "Stony Brook Supercomputing Center Success Story",
    url: "https://sbusc.stonybrook.edu/stories",
    date: "",
    description:
      "Featured by Stony Brook University’s Supercomputing Center for achievements in high-performance computing research.",
  },
];

export const service = [
  {
    role: "Web Chair",
    venue: "IEEE International Conference on Cluster Computing (CLUSTER)",
    year: "2026",
  },
  {
    role: "Student Volunteer",
    venue: "IEEE International Conference on Cluster Computing (CLUSTER)",
    year: "2026",
  },
  {
    role: "Student Volunteer",
    venue: "International Parallel & Distributed Processing Symposium (IPDPS)",
    year: "2026",
  },
  {
    role: "Student Volunteer",
    venue: "IEEE International Conference on Parallel Processing (ICPP)",
    year: "2025",
  },
];

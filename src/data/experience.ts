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
    organization: "Synergy Lab, Virginia Tech",
    role: "Graduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "Mar 2022 – Present",
    summary:
      "High-performance systems for scalable genomic analysis, medical imaging, and edge computing.",
    details: [
      "Studied SparkLeBLAST scalability on A64FX systems and worked with RIKEN collaborators on data layout, vectorization, and format-conversion bottlenecks.",
      "Explored Apache Arrow and Arrow Flight for genomic analysis pipelines; contributed to low-dose chest CT enhancement work using 3D-DDNet and VGG-based models.",
    ],
  },
  {
    organization: "InfoVis Lab, Virginia Tech",
    role: "Undergraduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "May 2021 – May 2022",
    summary:
      "Interactive visual analytics for image sorting and human-in-the-loop machine learning.",
    details: [
      "Worked on Andromeda features for exploratory sorting of edamame seed images.",
      "Built tools for clustering images using domain feedback, pretrained image projections, and tuned feature-space distance weights.",
    ],
  },
  {
    organization: "Crawford Lab, Virginia Tech",
    url: "https://crawford.chem.vt.edu/",
    role: "Undergraduate Research Assistant",
    location: "Blacksburg, Virginia",
    dates: "Jan 2020 – May 2022",
    summary:
      "Numerical methods and machine learning for real-time coupled-cluster calculations.",
    details: [
      "Worked on localized orbital spaces, mixed-precision arithmetic, GPU utilization, and machine learning for real-time coupled-cluster calculations.",
      "Used the Pade approximant method to reduce simulation time for accurate results from about 2000 atomic units to about 200; developed signal-analysis and LSTM forecasting routines.",
    ],
  },
];
export const internships: Experience[] = [
  {
    organization: "Oak Ridge National Laboratory",
    role: "Student Intern",
    location: "Oak Ridge, Tennessee",
    dates: "May 2025 – Aug 2025",
    summary:
      "GPU kernel optimization for fused matrix operations on modern Nvidia architectures.",
    details: [
      "Built tiled GEMM kernels in CUDA and a profiling harness for GPU memory hierarchy, occupancy, and warp scheduling experiments.",
      "Used Triton to implement and tune fused GEMM+SiLU kernels, reaching roughly 1.2-1.35x single-precision speedups over a PyTorch baseline on Ampere and Hopper GPUs.",
      "Prototyped a full SwiGLU fusion in CUTLASS with a Python-callable C++ kernel interface.",
    ],
  },
  {
    organization: "RIKEN Center for Computational Science",
    role: "Student Research Intern",
    location: "Tokyo, Japan",
    dates: "Oct 2024 – Dec 2024",
    summary:
      "Scalable search algorithms for identifying cancer-associated mutation combinations.",
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
      "Backend infrastructure for IoT indexing, progress tracking, and operational reporting.",
    details: [
      "Worked on indexing and querying workflows for millions of IoT devices across multiple databases.",
      "Built a tracking feature for indexing progress, wrote status data into Elasticsearch, and used AWS CloudWatch for backfill metrics.",
    ],
  },
];

require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const mongoose = require('mongoose');
const Question = require('../models/Question');
const logger = require('../config/logger');

const questions = [
  // ── Frontend Developer ────────────────────────────────────────
  { role: 'Frontend Developer', text: 'Explain the difference between let, const, and var in JavaScript.', category: 'JavaScript', difficulty: 'Easy', keyConcepts: ['scope', 'hoisting', 'temporal dead zone', 'block scope', 'function scope'], followUp: 'What is the temporal dead zone and when does it occur?' },
  { role: 'Frontend Developer', text: 'What is the Virtual DOM in React and how does it improve performance?', category: 'React', difficulty: 'Medium', keyConcepts: ['virtual DOM', 'diffing', 'reconciliation', 'fiber', 'real DOM', 'performance'], followUp: 'How does React\'s reconciliation algorithm (Fiber) decide what to re-render?' },
  { role: 'Frontend Developer', text: 'Explain CSS specificity and how the cascade works.', category: 'CSS', difficulty: 'Easy', keyConcepts: ['specificity', 'cascade', 'inheritance', 'selector weight', 'inline', 'id', 'class'], followUp: 'When should you use !important and what are the dangers?' },
  { role: 'Frontend Developer', text: 'What are React Hooks? Explain useEffect with cleanup.', category: 'React', difficulty: 'Medium', keyConcepts: ['hooks', 'useEffect', 'dependency array', 'cleanup', 'side effects', 'lifecycle'], followUp: 'What happens if you omit the dependency array entirely from useEffect?' },
  { role: 'Frontend Developer', text: 'How does event bubbling and capturing work in the DOM?', category: 'JavaScript', difficulty: 'Medium', keyConcepts: ['bubbling', 'capturing', 'propagation', 'stopPropagation', 'target', 'currentTarget'], followUp: 'How would you use event delegation to handle clicks on a dynamically generated list?' },
  { role: 'Frontend Developer', text: 'Explain Web Vitals (LCP, FID, CLS) and how to optimize each one.', category: 'Performance', difficulty: 'Hard', keyConcepts: ['LCP', 'FID', 'CLS', 'core web vitals', 'lazy loading', 'layout shift', 'interactivity'], followUp: 'How would you measure these metrics in a CI/CD pipeline?' },
  { role: 'Frontend Developer', text: 'What is CORS and how do you configure it correctly?', category: 'Web', difficulty: 'Medium', keyConcepts: ['CORS', 'preflight', 'origin', 'Access-Control headers', 'credentials', 'OPTIONS'], followUp: 'What are preflight requests and when are they triggered?' },
  { role: 'Frontend Developer', text: 'Explain code splitting in React and how to implement it.', category: 'React', difficulty: 'Hard', keyConcepts: ['code splitting', 'lazy', 'Suspense', 'dynamic import', 'bundle size', 'webpack'], followUp: 'How would you code-split by route in a React Router application?' },
  { role: 'Frontend Developer', text: 'What is the difference between useMemo and useCallback?', category: 'React', difficulty: 'Medium', keyConcepts: ['useMemo', 'useCallback', 'memoization', 'referential equality', 'performance', 're-render'], followUp: 'Can overusing useMemo actually hurt performance? When?' },
  { role: 'Frontend Developer', text: 'How does the JavaScript event loop work? Explain call stack, task queue, and microtask queue.', category: 'JavaScript', difficulty: 'Hard', keyConcepts: ['event loop', 'call stack', 'task queue', 'microtask', 'Promise', 'async', 'setTimeout'], followUp: 'What is the order of execution for Promises vs setTimeout callbacks?' },

  // ── Backend Engineer ──────────────────────────────────────────
  { role: 'Backend Engineer', text: 'Explain RESTful API design principles and best practices.', category: 'API Design', difficulty: 'Easy', keyConcepts: ['REST', 'stateless', 'HTTP methods', 'status codes', 'resource naming', 'idempotent'], followUp: 'What is HATEOAS and when would you implement it?' },
  { role: 'Backend Engineer', text: 'What is database indexing and how does it improve query performance?', category: 'Database', difficulty: 'Medium', keyConcepts: ['index', 'B-tree', 'query performance', 'composite index', 'covering index', 'write overhead'], followUp: 'What are the disadvantages of over-indexing a table?' },
  { role: 'Backend Engineer', text: 'Explain the CAP theorem in distributed systems with examples.', category: 'Distributed Systems', difficulty: 'Hard', keyConcepts: ['CAP theorem', 'consistency', 'availability', 'partition tolerance', 'CP', 'AP', 'trade-off'], followUp: 'Give a real-world example of a system that chooses AP over CP and why.' },
  { role: 'Backend Engineer', text: 'Describe JWT authentication flow and its security implications.', category: 'Security', difficulty: 'Medium', keyConcepts: ['JWT', 'header', 'payload', 'signature', 'access token', 'refresh token', 'expiry', 'XSS', 'CSRF'], followUp: 'How do you securely handle token refresh and rotation?' },
  { role: 'Backend Engineer', text: 'Explain different caching strategies and when to use each.', category: 'Caching', difficulty: 'Hard', keyConcepts: ['cache-aside', 'write-through', 'write-back', 'Redis', 'TTL', 'cache invalidation', 'LRU'], followUp: 'How would you handle cache invalidation in a distributed system?' },
  { role: 'Backend Engineer', text: 'What is connection pooling and why is it critical in production?', category: 'Database', difficulty: 'Medium', keyConcepts: ['connection pool', 'max connections', 'pool exhaustion', 'timeout', 'resource management'], followUp: 'What happens when the connection pool is exhausted under high load?' },
  { role: 'Backend Engineer', text: 'How would you design a rate limiter for a public API?', category: 'System Design', difficulty: 'Hard', keyConcepts: ['rate limiting', 'token bucket', 'leaky bucket', 'sliding window', 'Redis', 'IP-based', 'user-based'], followUp: 'How would your design handle distributed servers behind a load balancer?' },
  { role: 'Backend Engineer', text: 'Explain ACID properties in databases.', category: 'Database', difficulty: 'Medium', keyConcepts: ['atomicity', 'consistency', 'isolation', 'durability', 'transaction', 'rollback'], followUp: 'What is the difference between read committed and repeatable read isolation levels?' },

  // ── Data Scientist ────────────────────────────────────────────
  { role: 'Data Scientist', text: 'Explain the bias-variance tradeoff in machine learning.', category: 'ML Theory', difficulty: 'Medium', keyConcepts: ['bias', 'variance', 'underfitting', 'overfitting', 'regularization', 'tradeoff', 'generalization'], followUp: 'How do regularization techniques like L1 and L2 help manage this tradeoff?' },
  { role: 'Data Scientist', text: 'What is the difference between bagging and boosting? Give examples.', category: 'Ensemble Methods', difficulty: 'Medium', keyConcepts: ['bagging', 'boosting', 'Random Forest', 'XGBoost', 'AdaBoost', 'parallel', 'sequential', 'variance reduction'], followUp: 'When would you choose XGBoost over Random Forest?' },
  { role: 'Data Scientist', text: 'Explain gradient descent and its variants (SGD, Adam, RMSprop).', category: 'Optimization', difficulty: 'Hard', keyConcepts: ['gradient descent', 'learning rate', 'SGD', 'Adam', 'RMSprop', 'momentum', 'convergence', 'loss surface'], followUp: 'What problems does the Adam optimizer solve that SGD does not?' },
  { role: 'Data Scientist', text: 'How do you handle class imbalance in a classification dataset?', category: 'Data Processing', difficulty: 'Medium', keyConcepts: ['class imbalance', 'SMOTE', 'oversampling', 'undersampling', 'class weights', 'precision', 'recall', 'F1'], followUp: 'Why is accuracy a poor metric for imbalanced datasets?' },
  { role: 'Data Scientist', text: 'Explain the attention mechanism in transformers.', category: 'Deep Learning', difficulty: 'Hard', keyConcepts: ['attention', 'self-attention', 'query', 'key', 'value', 'multi-head', 'transformer', 'softmax', 'scaled dot product'], followUp: 'What is positional encoding and why is it needed in transformers?' },
  { role: 'Data Scientist', text: 'What is cross-validation and when would you use stratified k-fold?', category: 'Model Evaluation', difficulty: 'Easy', keyConcepts: ['cross-validation', 'k-fold', 'stratified', 'validation set', 'overfitting', 'generalization', 'bias'], followUp: 'How does leave-one-out cross-validation differ from k-fold?' },

  // ── Full Stack Developer ──────────────────────────────────────
  { role: 'Full Stack Developer', text: 'Explain the differences between SQL and NoSQL databases and when to use each.', category: 'Database', difficulty: 'Medium', keyConcepts: ['SQL', 'NoSQL', 'schema', 'ACID', 'scalability', 'MongoDB', 'PostgreSQL', 'use case'], followUp: 'How would you choose between PostgreSQL and MongoDB for a social media application?' },
  { role: 'Full Stack Developer', text: 'What is the difference between authentication and authorization?', category: 'Security', difficulty: 'Easy', keyConcepts: ['authentication', 'authorization', 'identity', 'permissions', 'RBAC', 'JWT', 'OAuth'], followUp: 'How would you implement role-based access control (RBAC) in a REST API?' },
  { role: 'Full Stack Developer', text: 'Explain how Docker and containerization work.', category: 'DevOps', difficulty: 'Medium', keyConcepts: ['Docker', 'container', 'image', 'Dockerfile', 'port binding', 'volumes', 'isolation', 'vs VM'], followUp: 'What is the difference between a Docker image and a container?' },
  { role: 'Full Stack Developer', text: 'What is CI/CD and how would you set up a pipeline for a Node.js app?', category: 'DevOps', difficulty: 'Medium', keyConcepts: ['CI', 'CD', 'GitHub Actions', 'pipeline', 'test', 'build', 'deploy', 'automation'], followUp: 'How would you handle rollback if a deployment fails in production?' },

  // ── ML Engineer ───────────────────────────────────────────────
  { role: 'ML Engineer', text: 'How do you deploy a machine learning model to production?', category: 'MLOps', difficulty: 'Medium', keyConcepts: ['model serving', 'REST API', 'FastAPI', 'Docker', 'monitoring', 'versioning', 'A/B testing', 'drift'], followUp: 'How would you monitor a model for data drift in production?' },
  { role: 'ML Engineer', text: 'Explain the difference between batch inference and real-time inference.', category: 'MLOps', difficulty: 'Medium', keyConcepts: ['batch', 'real-time', 'latency', 'throughput', 'Kafka', 'streaming', 'cost', 'use case'], followUp: 'What are the trade-offs in choosing between batch and online serving?' },

  // ── DevOps Engineer ───────────────────────────────────────────
  { role: 'DevOps Engineer', text: 'Explain Kubernetes architecture and the role of pods, services, and deployments.', category: 'Kubernetes', difficulty: 'Hard', keyConcepts: ['pod', 'service', 'deployment', 'node', 'cluster', 'kubectl', 'ingress', 'ConfigMap', 'scaling'], followUp: 'How does a Kubernetes service discover and route traffic to pods?' },
  { role: 'DevOps Engineer', text: 'What is Infrastructure as Code (IaC) and how does Terraform implement it?', category: 'IaC', difficulty: 'Medium', keyConcepts: ['IaC', 'Terraform', 'state file', 'provider', 'resource', 'plan', 'apply', 'idempotent'], followUp: 'How do you manage Terraform state in a team environment?' },

  // ── System Design ─────────────────────────────────────────────
  { role: 'System Design', text: 'Design a URL shortener like bit.ly. Walk through your architecture.', category: 'System Design', difficulty: 'Hard', keyConcepts: ['hash function', 'base62', 'database', 'redirect', 'cache', 'load balancer', 'analytics', 'scale'], followUp: 'How would you handle 1 billion URLs with high read traffic?' },
  { role: 'System Design', text: 'Design a notification system that can send emails, SMS, and push notifications.', category: 'System Design', difficulty: 'Hard', keyConcepts: ['message queue', 'Kafka', 'pub-sub', 'retry', 'rate limiting', 'template', 'priority', 'idempotency'], followUp: 'How would you guarantee exactly-once delivery of notifications?' },
  { role: 'System Design', text: 'How would you design a real-time chat application like WhatsApp?', category: 'System Design', difficulty: 'Hard', keyConcepts: ['WebSocket', 'message queue', 'database', 'presence', 'delivery receipt', 'push notifications', 'sharding'], followUp: 'How would you handle message ordering and delivery guarantees?' },
];

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    const inserted = await Question.insertMany(questions);
    console.log(`✅ Seeded ${inserted.length} questions successfully`);

    await mongoose.connection.close();
    console.log('✅ Seeding complete!');
  } catch (err) {
    console.error('❌ Seeding failed:', err.message);
    process.exit(1);
  }
};

seedDB();

const BANK = {
  Databases: [
    q('Which SQL clause filters rows before grouping?', ['HAVING', 'WHERE', 'ORDER BY', 'GROUP BY'], 1, 'SQL filtering', 'WHERE filters individual rows before GROUP BY is applied.', 'Easy'),
    q('What is the main purpose of database normalization?', ['Increase duplicate data', 'Reduce redundancy and update anomalies', 'Avoid primary keys', 'Replace indexes'], 1, 'Normalization', 'Normalization organizes data to reduce redundancy and prevent insert, update, and delete anomalies.', 'Easy'),
    q('Which property guarantees that a transaction is all-or-nothing?', ['Consistency', 'Isolation', 'Durability', 'Atomicity'], 3, 'Transactions', 'Atomicity means every operation in a transaction succeeds together or the transaction is rolled back.', 'Easy'),
    q('A query frequently searches users by email. What is usually the best first optimization?', ['Add an index on email', 'Move email to another table', 'Use SELECT *', 'Remove the WHERE clause'], 0, 'Indexing', 'An index on the searched column can greatly reduce lookup work for selective queries.', 'Medium'),
    q('Which JOIN returns only rows that have matching values in both tables?', ['LEFT JOIN', 'FULL JOIN', 'INNER JOIN', 'CROSS JOIN'], 2, 'Joins', 'INNER JOIN keeps only rows that satisfy the join condition in both tables.', 'Medium'),
    q('Why is a foreign key useful?', ['It encrypts a table', 'It enforces referential integrity', 'It sorts query output', 'It replaces all indexes'], 1, 'Keys', 'A foreign key ensures referenced values correspond to valid rows in the parent table.', 'Medium'),
    q('Two transactions update the same row at the same time. Which ACID property is primarily concerned with their interaction?', ['Atomicity', 'Consistency', 'Isolation', 'Durability'], 2, 'Transactions', 'Isolation defines how concurrent transactions observe and affect each other.', 'Medium'),
    q('What does EXPLAIN commonly help you inspect?', ['Database passwords', 'Query execution plan', 'Table ownership', 'Backup history'], 1, 'Query optimization', 'EXPLAIN shows how the database plans to access tables, indexes, joins, and filters.', 'Medium'),
    q('Which index is generally most useful for WHERE account_id = ? AND created_at > ? when both columns are frequently used together?', ['An index only on created_at', 'A composite index on account_id, created_at', 'No index', 'An index on an unrelated text column'], 1, 'Indexing', 'A composite index beginning with account_id can support the equality lookup and then the created_at range.', 'Hard'),
    q('Why can SELECT * be undesirable in production APIs?', ['It always causes syntax errors', 'It can read unnecessary columns and tightly couple callers to schema changes', 'It disables transactions', 'It removes indexes'], 1, 'Query design', 'Selecting only required columns reduces data transfer and makes dependencies clearer.', 'Hard'),
  ],
  'Web Development': [
    q('Which HTTP method is conventionally used to retrieve a resource without modifying it?', ['POST', 'GET', 'PATCH', 'DELETE'], 1, 'HTTP', 'GET is intended for safe resource retrieval.', 'Easy'),
    q('What does CSS primarily control?', ['Database schema', 'Presentation and layout', 'Server routing', 'Git history'], 1, 'CSS', 'CSS controls visual presentation, layout, spacing, typography, and responsive behavior.', 'Easy'),
    q('In React, what is state used for?', ['Storing values that can change and trigger rendering', 'Compiling Java', 'Creating SQL indexes', 'Configuring DNS'], 0, 'React state', 'State represents component data that can change over time and cause the UI to rerender.', 'Easy'),
    q('What does a 404 HTTP status indicate?', ['Authentication succeeded', 'Resource was not found', 'Server permanently crashed', 'Request was cached'], 1, 'HTTP', '404 means the server could not find the requested resource.', 'Medium'),
    q('Why should API keys usually not be embedded in frontend JavaScript?', ['Browsers cannot run JavaScript', 'They can be exposed to anyone using the application', 'They prevent CSS loading', 'They disable HTTPS'], 1, 'Web security', 'Frontend code is delivered to the browser, so secrets embedded there can be inspected by users.', 'Medium'),
    q('Which browser API is commonly used to make HTTP requests from modern JavaScript?', ['fetch', 'printf', 'scanf', 'grep'], 0, 'JavaScript APIs', 'The fetch API provides Promise-based HTTP requests in modern browsers.', 'Medium'),
    q('What is the main benefit of semantic HTML?', ['It hides all content', 'It improves structure, accessibility, and meaning', 'It replaces JavaScript', 'It prevents network calls'], 1, 'Accessibility', 'Semantic elements communicate document structure to browsers and assistive technologies.', 'Medium'),
    q('A React list changes order. Why are stable key props important?', ['They encrypt components', 'They help React preserve item identity during reconciliation', 'They create API routes', 'They load CSS'], 1, 'React rendering', 'Stable keys let React match list items correctly between renders.', 'Medium'),
    q('What is CORS designed to control?', ['Cross-origin browser requests', 'SQL transactions', 'CPU scheduling', 'Git rebases'], 0, 'Web security', 'CORS controls whether browser code from one origin may access resources from another origin.', 'Hard'),
    q('An API operation may be retried after a timeout. Which design property helps avoid duplicate effects?', ['Idempotency', 'Polymorphism', 'Minification', 'Hoisting'], 0, 'API design', 'Idempotent operations can be repeated without creating unintended additional side effects.', 'Hard'),
  ],
  OOP: [
    q('What does encapsulation primarily mean?', ['Exposing all fields publicly', 'Bundling data and behavior while controlling access', 'Avoiding methods', 'Using only global variables'], 1, 'Encapsulation', 'Encapsulation keeps related state and behavior together and controls how internal state is accessed.', 'Easy'),
    q('Inheritance represents which relationship most directly?', ['has-a', 'uses-a', 'is-a', 'owns-a database'], 2, 'Inheritance', 'Inheritance commonly models an is-a relationship between a derived type and a base type.', 'Easy'),
    q('What is polymorphism?', ['One interface supporting multiple implementations', 'One variable having only one value', 'A database join', 'A CSS layout rule'], 0, 'Polymorphism', 'Polymorphism allows different types to be used through a common abstraction or interface.', 'Easy'),
    q('Why are interfaces useful?', ['They define a contract without requiring one concrete implementation', 'They store database rows', 'They replace constructors', 'They prevent testing'], 0, 'Interfaces', 'Interfaces let callers depend on behavior contracts rather than concrete classes.', 'Medium'),
    q('Composition is often described as which relationship?', ['is-a', 'has-a', 'equals-a', 'throws-a'], 1, 'Composition', 'Composition builds objects from other objects and is commonly described as a has-a relationship.', 'Medium'),
    q('Which SOLID principle says a class should have one primary reason to change?', ['Open/Closed', 'Single Responsibility', 'Liskov Substitution', 'Dependency Inversion'], 1, 'SOLID', 'The Single Responsibility Principle focuses each module or class on one cohesive responsibility.', 'Medium'),
    q('What is method overriding?', ['A subclass providing its own implementation of an inherited method', 'Calling two methods at once', 'Deleting a constructor', 'Creating a database index'], 0, 'Inheritance', 'Overriding replaces inherited behavior for a subtype while keeping the same method contract.', 'Medium'),
    q('Dependency inversion encourages high-level modules to depend on what?', ['Concrete database drivers only', 'Abstractions', 'Global variables', 'UI colors'], 1, 'SOLID', 'Dependency Inversion recommends depending on abstractions rather than concrete implementation details.', 'Medium'),
    q('A subtype requires stricter preconditions than its base type. Which principle may be violated?', ['Single Responsibility', 'Liskov Substitution', 'Interface Segregation', 'Open/Closed'], 1, 'SOLID', 'Liskov Substitution requires subtypes to remain usable wherever the base type is expected.', 'Hard'),
    q('Why can composition be preferable to deep inheritance hierarchies?', ['It supports flexible behavior assembly with less coupling', 'It removes all objects', 'It prevents reuse', 'It requires global state'], 0, 'Composition', 'Composition can combine behaviors explicitly and avoids tight coupling to a complex inheritance tree.', 'Hard'),
  ],
  'Design Systems': [
    q('What is a design token?', ['A reusable named design value such as color or spacing', 'A database password', 'An API endpoint', 'A Git branch'], 0, 'Design tokens', 'Tokens centralize reusable design decisions such as color, spacing, radius, and typography.', 'Easy'),
    q('Why should reusable UI components expose clear APIs?', ['To make usage consistent and predictable', 'To prevent reuse', 'To remove accessibility', 'To store SQL'], 0, 'Component APIs', 'A clear component API makes behavior and customization consistent across products.', 'Easy'),
    q('What is the purpose of a focus state?', ['Show keyboard focus and support accessible navigation', 'Hide interactive elements', 'Disable buttons permanently', 'Compress images'], 0, 'Accessibility', 'Visible focus states help keyboard users understand which control is active.', 'Easy'),
    q('Why are spacing scales useful?', ['They create consistent rhythm across layouts', 'They replace responsive design', 'They disable CSS', 'They store user data'], 0, 'Design tokens', 'A spacing scale reduces arbitrary values and makes layout rhythm more consistent.', 'Medium'),
    q('What should a Button component usually define centrally?', ['Variants, states, sizing, and accessibility behavior', 'Customer passwords', 'Database joins', 'Deployment logs'], 0, 'Components', 'Centralizing button variants and states prevents inconsistent implementations.', 'Medium'),
    q('Why is color alone insufficient to communicate an error?', ['It increases bundle size', 'Some users may not perceive the color difference', 'Browsers cannot display red', 'It breaks HTTP'], 1, 'Accessibility', 'Errors should use text, icons, or other cues in addition to color for accessibility.', 'Medium'),
    q('What is a component variant?', ['A supported visual or behavioral version of a component', 'A database backup', 'A JavaScript runtime', 'A network protocol'], 0, 'Components', 'Variants capture intentional component options such as primary, secondary, danger, or compact.', 'Medium'),
    q('Why document component usage guidelines?', ['To help teams use components consistently and understand constraints', 'To prevent onboarding', 'To remove examples', 'To avoid testing'], 0, 'Documentation', 'Usage guidance explains when and how components should be applied.', 'Medium'),
    q('A product team repeatedly overrides a component with one-off CSS. What is the best design-system response?', ['Ignore the pattern', 'Investigate whether the component API or token set is missing a legitimate use case', 'Ban CSS entirely', 'Duplicate the component for every screen'], 1, 'System evolution', 'Repeated overrides often signal an unmet reusable requirement that should be evaluated centrally.', 'Hard'),
    q('What is the strongest reason to test design-system components in isolation and in consuming apps?', ['To verify both component behavior and integration assumptions', 'To avoid versioning', 'To eliminate documentation', 'To replace product testing'], 0, 'Testing', 'Isolated tests validate the component contract while integration testing catches consumer-specific issues.', 'Hard'),
  ],
  DevOps: [
    q('What does CI stand for?', ['Continuous Integration', 'Central Interface', 'Code Isolation', 'Container Index'], 0, 'CI/CD', 'Continuous Integration automatically validates changes as developers integrate code frequently.', 'Easy'),
    q('What is a container image?', ['A packaged filesystem and metadata used to create containers', 'A screenshot', 'A database row', 'A Git commit message'], 0, 'Containers', 'A container image packages application code, runtime dependencies, and metadata for reproducible execution.', 'Easy'),
    q('Why use environment variables for configuration?', ['To separate deploy-time configuration from source code', 'To replace version control', 'To disable logs', 'To compile CSS'], 0, 'Configuration', 'Environment variables allow the same build to run with different environment-specific settings.', 'Easy'),
    q('What is the purpose of a health check?', ['Verify whether a service is running and ready to serve traffic', 'Format source code', 'Create database tables', 'Generate UI icons'], 0, 'Observability', 'Health checks allow orchestration and monitoring systems to detect unhealthy service instances.', 'Medium'),
    q('What does a deployment rollback do?', ['Returns a service to a previous known-good release', 'Deletes all Git history', 'Creates a new programming language', 'Disables backups'], 0, 'Deployment', 'Rollback restores a prior stable version when a release causes problems.', 'Medium'),
    q('Why pin dependency versions in production builds?', ['To improve reproducibility', 'To make every build random', 'To remove testing', 'To disable package managers'], 0, 'Builds', 'Pinned versions reduce unexpected changes between builds.', 'Medium'),
    q('What is the difference between logs and metrics?', ['Logs are event records; metrics are numeric measurements over time', 'They are always identical', 'Metrics contain source code only', 'Logs cannot include timestamps'], 0, 'Observability', 'Logs capture detailed events while metrics summarize measurable system behavior.', 'Medium'),
    q('Why should secrets not be committed to Git?', ['Repository history can expose them even after later deletion', 'Git cannot store text', 'Secrets prevent branches', 'It slows CSS'], 0, 'Security', 'Committed secrets can persist in repository history and may be accessible to unintended users.', 'Medium'),
    q('A service has high latency but low CPU usage. Which observability data is most useful next?', ['Request traces and dependency latency', 'Only source formatting', 'UI theme colors', 'Git username'], 0, 'Observability', 'Distributed traces and dependency timings help identify waiting on downstream services or I/O.', 'Hard'),
    q('Why are immutable deployment artifacts valuable?', ['The exact tested artifact can be promoted across environments', 'They allow production files to be edited manually', 'They remove the need for testing', 'They require different code per environment'], 0, 'Deployment', 'Immutable artifacts reduce drift because the same tested build is promoted rather than rebuilt differently.', 'Hard'),
  ],
};

function q(question, options, correctIndex, concept, explanation, difficulty) {
  return { question, options, correctIndex, concept, explanation, difficulty };
}

function shuffle(items) {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

export function generateLocalQuiz({ topic, focusConcepts = [] }) {
  const questions = BANK[topic];
  if (!questions) throw new Error(`No built-in question bank found for ${topic}.`);

  const focus = new Set((focusConcepts || []).map((x) => String(x).toLowerCase()));
  const prioritized = questions.filter((item) => focus.has(String(item.concept).toLowerCase()));
  const rest = questions.filter((item) => !focus.has(String(item.concept).toLowerCase()));
  return [...shuffle(prioritized), ...shuffle(rest)].slice(0, 10);
}

export const LOCAL_MODEL = 'LOCAL_QUESTION_BANK';

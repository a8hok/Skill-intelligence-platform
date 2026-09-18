export const topics = [
  {
    name: 'Databases',
    level: 'Engineering college',
    description: 'SQL, normalization, keys, joins, indexing, transactions, and database design fundamentals.',
  },
  {
    name: 'Web Development',
    level: 'Engineering college',
    description: 'HTML, CSS, JavaScript, browser fundamentals, HTTP, REST APIs, React concepts, and web security basics.',
  },
  {
    name: 'OOP',
    level: 'Engineering college',
    description: 'Classes, objects, encapsulation, inheritance, polymorphism, abstraction, interfaces, and SOLID foundations.',
  },
  {
    name: 'Design Systems',
    level: 'Engineering college',
    description: 'UI foundations, reusable components, tokens, accessibility, consistency, responsive design, and component APIs.',
  },
  {
    name: 'DevOps',
    level: 'Engineering college',
    description: 'Git, CI/CD, containers, environments, deployment, observability, automation, and cloud fundamentals.',
  },
];

export function findTopic(name) {
  return topics.find((item) => item.name.toLowerCase() === String(name).toLowerCase());
}

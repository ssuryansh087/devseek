import type { Node, Edge } from "reactflow";

export function generateRoadmapData(
  topic: string,
  timeframe: string,
  experienceLevel: string
) {
  const nodes: Node[] = [];
  const edges: Edge[] = [];

  nodes.push({
    id: "main",
    type: "roadmapNode",
    position: { x: 0, y: 0 },
    data: {
      title: `Learning Roadmap: Rust for Systems Programming (${timeframe})`,
      subtitle: `This roadmap assumes ${experienceLevel}.`,
      content:
        "A more realistic timeframe for complete mastery, including deeper exploration of advanced topics, would be 6-8 months. However, this 4-month plan focuses on achieving a solid foundation and practical proficiency.",
      type: "phase",
    },
  });

  nodes.push({
    id: "phase1",
    type: "roadmapNode",
    position: { x: 0, y: 150 },
    data: {
      title: "Phase 1: Rust Fundamentals (Month 1)",
      subtitle:
        "Master basic Rust syntax, data structures, ownership, and borrowing.",
      type: "phase",
    },
  });

  edges.push({
    id: "main-phase1",
    source: "main",
    target: "phase1",
    type: "smoothstep",
  });

  nodes.push({
    id: "week1",
    type: "roadmapNode",
    position: { x: -400, y: 300 },
    data: {
      title: "Week 1: Getting Started",
      subtitle: "Installation, basic syntax, functions, comments.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read the official Rust book: <a href="https://doc.rust-lang.org/book/" target="_blank">https://doc.rust-lang.org/book/</a> (Chapters 1-3)</li>
          <li>Complete the Rustlings exercises: <a href="https://github.com/rust-lang/rustlings" target="_blank">https://github.com/rust-lang/rustlings</a></li>
          <li>Practice writing simple programs (e.g., calculating area, simple text processing).</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase1-week1",
    source: "phase1",
    target: "week1",
    type: "smoothstep",
  });

  nodes.push({
    id: "week2",
    type: "roadmapNode",
    position: { x: -200, y: 300 },
    data: {
      title: "Week 2: Ownership and Borrowing",
      subtitle: "Ownership, borrowing, lifetimes, mutability.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read the official Rust book: (Chapters 4-5)</li>
          <li>Work through more Rustlings exercises focusing on ownership and borrowing.</li>
          <li>Build a small project: Implement a simple linked list or stack.</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase1-week2",
    source: "phase1",
    target: "week2",
    type: "smoothstep",
  });

  nodes.push({
    id: "week3",
    type: "roadmapNode",
    position: { x: 200, y: 300 },
    data: {
      title: "Week 3: Data Structures and Collections",
      subtitle: "Vectors, arrays, strings, hash maps, enums, structs.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read the official Rust book: (Chapters 6-7)</li>
          <li>Practice using different data structures in small programs.</li>
          <li>Build a small project: Implement a simple text-based game (e.g., number guessing game).</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase1-week3",
    source: "phase1",
    target: "week3",
    type: "smoothstep",
  });

  nodes.push({
    id: "week4",
    type: "roadmapNode",
    position: { x: 400, y: 300 },
    data: {
      title: "Week 4: Error Handling and Modules",
      subtitle:
        "Result type, panic!, unwrap(), error handling strategies, modules.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read the official Rust book: (Chapters 8-9)</li>
          <li>Practice writing functions that handle potential errors gracefully.</li>
          <li>Build a small project: Create a program that reads data from a file, processes it, and handles potential file errors.</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase1-week4",
    source: "phase1",
    target: "week4",
    type: "smoothstep",
  });

  nodes.push({
    id: "phase2",
    type: "roadmapNode",
    position: { x: 0, y: 450 },
    data: {
      title: "Phase 2: Intermediate Rust and Concurrency (Month 2)",
      subtitle:
        "Understand advanced Rust concepts like generics, traits, and concurrency.",
      type: "phase",
    },
  });

  edges.push({
    id: "phase1-phase2",
    source: "phase1",
    target: "phase2",
    type: "smoothstep",
  });

  nodes.push({
    id: "week5",
    type: "roadmapNode",
    position: { x: -400, y: 600 },
    data: {
      title: "Week 5: Generics and Traits",
      subtitle: "Generics, traits, trait bounds, implementing traits.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read the official Rust book: (Chapter 10)</li>
          <li>Implement several traits on custom data structures.</li>
          <li>Build a small project: Create a generic function that sorts different data types.</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase2-week5",
    source: "phase2",
    target: "week5",
    type: "smoothstep",
  });

  nodes.push({
    id: "week6",
    type: "roadmapNode",
    position: { x: -200, y: 600 },
    data: {
      title: "Week 6: Smart Pointers",
      subtitle: "Box, Rc, Arc, Mutex, other smart pointers.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read relevant sections of the official Rust book and documentation.</li>
          <li>Practice using different smart pointers in example scenarios.</li>
          <li>Build a small project: Implement a simple reference-counted data structure.</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase2-week6",
    source: "phase2",
    target: "week6",
    type: "smoothstep",
  });

  nodes.push({
    id: "week7",
    type: "roadmapNode",
    position: { x: 200, y: 600 },
    data: {
      title: "Week 7: Concurrency",
      subtitle: "Threads, mutexes, channels, asynchronous programming.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Read relevant sections of the official Rust book and documentation.</li>
          <li>Experiment with different concurrency patterns.</li>
          <li>Build a small project: Create a multi-threaded program that performs a computationally intensive task.</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase2-week7",
    source: "phase2",
    target: "week7",
    type: "smoothstep",
  });

  nodes.push({
    id: "week8",
    type: "roadmapNode",
    position: { x: 400, y: 600 },
    data: {
      title: "Week 8: Testing and Cargo",
      subtitle:
        "Unit tests, integration tests, Cargo for dependency management.",
      content: `
        <strong>Activities:</strong>
        <ul>
          <li>Learn how to write and run unit tests using Rust's testing framework.</li>
          <li>Practice using Cargo to manage dependencies for a small project.</li>
          <li>Refactor previous projects to include thorough testing.</li>
        </ul>
      `,
      type: "week",
    },
  });

  edges.push({
    id: "phase2-week8",
    source: "phase2",
    target: "week8",
    type: "smoothstep",
  });

  nodes.push({
    id: "phase3",
    type: "roadmapNode",
    position: { x: 0, y: 750 },
    data: {
      title: "Phase 3: Systems Programming Concepts (Month 3)",
      subtitle:
        "Apply Rust to systems programming tasks, utilizing relevant libraries and concepts.",
      content: `
        <strong>Week 9-12:</strong>
        <ul>
          <li><strong>Memory Management and Low-Level Programming:</strong> Understanding memory layouts, pointers, unsafe code, FFI.</li>
          <li><strong>Working with the Operating System:</strong> File I/O, process management, threads, inter-process communication.</li>
          <li><strong>Networking:</strong> TCP/IP, sockets, building simple network clients and servers.</li>
          <li><strong>Embedded Systems (Introduction):</strong> Basic concepts of embedded systems, using Rust for microcontrollers.</li>
        </ul>
      `,
      type: "phase",
    },
  });

  edges.push({
    id: "phase2-phase3",
    source: "phase2",
    target: "phase3",
    type: "smoothstep",
  });

  nodes.push({
    id: "phase4",
    type: "roadmapNode",
    position: { x: 0, y: 900 },
    data: {
      title: "Phase 4: Advanced Topics and Project (Month 4)",
      subtitle: "Consolidate your knowledge and build a substantial project.",
      content: `
        <strong>Week 13-16: Capstone Project</strong>
        <p>Choose a significant systems programming project. This could involve:</p>
        <ul>
          <li>Building a small operating system kernel</li>
          <li>Developing a network service or daemon</li>
          <li>Implementing a custom file system</li>
          <li>Building a device driver (if you've explored embedded systems)</li>
        </ul>
        <p>Break the project down into smaller manageable tasks and dedicate this time to building, testing, and refining your capstone project.</p>
      `,
      type: "phase",
    },
  });

  edges.push({
    id: "phase3-phase4",
    source: "phase3",
    target: "phase4",
    type: "smoothstep",
  });

  return { nodes, edges };
}

export enum MarkerType {
  Arrow = "arrow",
  ArrowClosed = "arrowclosed",
}

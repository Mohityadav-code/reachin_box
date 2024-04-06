const partsData = [
    { "messages": [{ "role": "user", "content": `I want to learn about react js main concepts and its usage in web development. Can you help me with that?` }, { "role": "assistant", "content": `  {"title": "React JS intro", "content": "React is a JavaScript library for building user interfaces. It is maintained by Facebook and a community of individual developers and companies. React can be used as a base in the development of single-page or mobile applications." } /arrHere { "title": "React JS components", "content": "Components are the heart of React. A component is a piece of the user interface. It can be a button, a form, a dialog, a screen, etc. In React, components are the building blocks of a UI." } /arrHere { "title": "React JS state", "content": "State is a built-in React object that allows components to hold and manage their own data. The state object is where you store property values that belong to the component. When the state object changes, the component re-renders." } /arrHere { "title": "React JS props", "content": "Props are short for properties. They are a way of passing data from parent to child components. Props are read-only, which means that a component can only read the props given to it." } /arrHere { "title": "React JS hooks", "content": "Hooks are a new addition in React 16.8. They let you use state and other React features without writing a class. Hooks are functions that let you “hook into” React state and lifecycle features from function components." } ` }] },
    { "messages": [{ "role": "user", "content": `I want to learn about Python programming language and its applications. Can you provide me with some information on this topic? ` }, { "role": "assistant", "content": ` { "title": "Python intro", "content": "Python is a high-level, interpreted programming language. It is known for its simplicity and readability. Python is widely used in web development, data science, machine learning, and artificial intelligence." } /arrHere { "title": "Python syntax", "content": "Python has a simple and easy-to-learn syntax. It is a great language for beginners to start with. Python code is often said to be almost like pseudocode, since it allows you to express very powerful ideas in very few lines of code while being very readable." } /arrHere { "title": "Python applications", "content": "Python is used for web development, data science, machine learning, artificial intelligence, scientific computing, and more. It is widely used in various industries and domains." } /arrHere { "title": "Python libraries", "content": "Python has a rich ecosystem of libraries and frameworks. Some popular Python libraries include NumPy, Pandas, Matplotlib, TensorFlow, Keras, Django, Flask, and more." } ` }] },
    { "messages": [{ "role": "user", "content": `I want to learn about the main concepts of web development and its technologies. Can you provide me with some information on this topic?` }, { "role": "assistant", "content": `{ "title": "Web development intro", "content": "Web development is the process of building and maintaining websites. It includes web design, web content development, client-side/server-side scripting, and network security configuration." } /arrHere { "title": "Web development technologies", "content": "Web development technologies include HTML, CSS, JavaScript, PHP, Python, Ruby, Java, .NET, and more. These technologies are used to create web applications, websites, and web services." } /arrHere { "title": "Web development concepts", "content": "Web development concepts include front-end development, back-end development, full-stack development, responsive design, user experience (UX) design, and more. These concepts are essential for building modern web applications." } /arrHere { "title": "Web development tools", "content": "Web development tools include text editors, IDEs, version control systems, web servers, and databases. These tools are used to create, test, and deploy web applications." } ` }] },
    { "messages": [{ "role": "user", "content": `Power BI` }, { "role": "assistant", "content": `{ "title": "Power BI features", "content": "Power BI features include data visualization, data modeling, data connectivity, data transformation, and more. It allows users to create interactive reports and dashboards from various data sources." } /arrHere { "title": "Power BI applications", "content": "Power BI is used for data analysis, reporting, and dashboarding. It is widely used in various industries and domains, including finance, marketing, sales, operations, and more." } ` }] },
    { "messages": [{ "role": "user", "content": `Data Science Main Main concept only no need to go in depth` }, { "role": "assistant", "content": `{ "title": "Data Science intro", "content": "Data science is an interdisciplinary field that uses scientific methods, processes, algorithms, and systems to extract knowledge and insights from structured and unstructured data." } /arrHere { "title": "Data Science concepts", "content": "Data science concepts include data analysis, machine learning, statistical modeling, data visualization, and more. These concepts are essential for understanding and analyzing data." } /arrHere { "title": "Data Science applications", "content": "Data science is used for data analysis, predictive modeling, pattern recognition, and decision-making. It is widely used in various industries and domains, including finance, healthcare, marketing, and more." } ` }] }
    ,
  ]



  function transformData(arr, input) {
    const part = []; // Initialize an empty array to store the transformed data
  
    arr.forEach(item => {
      const messages = item.messages;
      messages.forEach(message => {
        if (message.role === 'user') {
          part.push({ text: "input: " + message.content });
        } else if (message.role === 'assistant') {
          part.push({ text: "output: " + message.content });
        }
      });
    });
    part.push({ text: "input: " + input });
    return part;
  }
  
  
  
  const {
    GoogleGenerativeAI,
    HarmCategory,
    HarmBlockThreshold,
  } = require("@google/generative-ai");
  
  const MODEL_NAME = "gemini-1.0-pro";
  const API_KEY = "A33333########";
  
  async function run(input) {
    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });
  
    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };
  
    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];
  
    const parts = transformData(partsData, input);
  
  
  
    const result = await model.generateContent({
      contents: [{ role: "user", parts }],
      generationConfig,
      safetySettings,
    });
  
    const response = result.response;
    console.log(response.text());
    return response.text();
  }
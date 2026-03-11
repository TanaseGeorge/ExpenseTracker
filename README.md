# Expense Tracker

## What the App Does

Expense Tracker is a web application that helps users track and manage their personal expenses.

Users can:

- Create an account and log in
- Add, edit, and delete expenses
- Organize expenses using custom categories
- Filter expenses by category
- View summaries of their spending

The application also includes an **AI Spending Insight** feature.  
This feature analyzes the user’s expenses and generates a short financial insight with recommendations on how the user could improve their spending habits.

The insight is generated dynamically based on the user's expense data.



## Tech Stack

### Backend
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL

### Frontend
- React
- Vite
- CSS



## LLM / AI Tools Used

The AI insight feature uses:

- **Ollama**
- **Phi-3 Mini (Microsoft)**

The model runs **locally using Ollama**, meaning the application does not rely on external APIs or paid services.

The backend aggregates the user’s expenses and sends a structured prompt to the model.  
The model then returns a short analysis of the user’s spending habits.

Example data sent to the model:

Total spent: 520

Categories:
 - Food: 150
 - Transport: 60
 - Shopping: 220
 - Bills: 90

## LLMs and Development Tools

During development, several large language models were used as development assistants to support different parts of the project.

- **Claude** was primarily used to assist with backend implementation, including structuring FastAPI routes, database interactions, and improving the overall architecture of the backend code.
- **ChatGPT** was used mainly for frontend development tasks, debugging issues, and researching technical solutions during development.
- **Ollama (Phi-3 Mini)** was integrated directly into the application to generate AI Spending Insights based on the user's expense data.

These tools helped accelerate development, explore implementation alternatives, and refine prompt engineering strategies.



## Challenges and LLM Hallucinations

While working with LLMs during development, several hallucination-related challenges were encountered.

One example occurred when starting a new conversation focused on prompt engineering. Because the initial prompt provided to the model was too vague, the model generated a response that referenced **a previous project context** where it had been used earlier. This demonstrated how insufficiently specific prompts can cause a model to rely on unrelated assumptions instead of focusing on the current task.

Another challenge appeared in the **initial version of the prompt used with the Ollama model**. The prompt was too simple and lacked sufficient structure and constraints. As a result, the model generated **very general financial advice** and did not properly account for the relative importance of different expense categories.

To address this issue, the prompt was improved by:

- defining a clearer assistant role
- structuring the expense data before sending it to the model
- adding explicit instructions about how the analysis should be performed
- enforcing a stricter response format

After refining the prompt structure, the generated insights became significantly more relevant and better aligned with the user’s actual expense data.

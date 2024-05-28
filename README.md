# Pocket Micro - microeconomics and game theory visualisation tool

## ENG

## Description
Pocket Micro is a web application that allows users to visualise and interact with microeconomics and game theory concepts. It is designed to be used as a teaching aid for students and teachers of economics. The application is built using JavaScript and is hosted on GitHub Pages.

## Stack
- JavaScript
- HTML
- CSS
- Figma (for design)

## Site structure
The site is represented my main page with a list of topics. Each topic is a link to a separate page with a visualisation of the concept.

## Interaction
Interaction with all models is similar and is done by changin parameters in the left panel. The right panel contaons a table where user can specify parameters of participants in the model and see the results of the model. Some models go with additional visualisation of the results in the form of graphs.

## Models description
### Nash equilibrium
The Nash equilibrium visualisation is implemented for 2 agents. It has already made presets that depicts various possible outcomes. For custom settings, user can specify the number of possible strategies for each agent than click "Create/Clean" button to create a table with input fields to specify the payoffs for each strategy. After that, user can click "RUN" button to see the results of the model.
The iteration process is accompanied by the visualisation of all the steps in the resulting table. Each step is numerated also displayed in the right zone of the page with comments for each step. The final result forming nash equilibrium is highlighted in green.
User have ability to pause or resume the iteration process, as well as to go to the next or previous step or go to specific step by entering corresponding value in the step input field or via the slider.

### Serial dictatorship
Serial dictatorship algorithm is very simple by its nature. User specifies the number of agents and the number of objects. Then, user can specify the preferences of each agent for each object. After user can populate preferences automatically or manually. The algorithm is run by clicking "RUN" button. The result is displayed in the right zone of the page. The result is a table with the allocation of objects to agents. The process of the algorithm is also displayed in the table with values. The final allocation is highlighted in green.

### House allocation problem (Top trading cycle)
User can add or remove agent by clicking "Add/Remove participant buttons. User can specify the initial endowment of each agent and preferences over the houses. It can also be done automatically or manually. The algorithm is run by clicking "RUN" button. The visualisation is repreesnt by an svg canvas with graph of the allocation process. The final allocation is displayed there as well as in the table.



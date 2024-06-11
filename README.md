# Pocket Micro - Microeconomics and Game Theory Visualisation Tool

## [English Version](#eng) | [Версия на русском](#rus)
### Navigation
- [Description](#description) | [Описание](#описание)
- [Stack](#stack) | [Технологии](#технологии)
- [Site Structure](#site-structure) | [Структура сайта](#структура-сайта)
- [Interaction](#interaction) | [Взаимодействие](#взаимодействие)
- [Models Description](#models-description) | [Описание моделей](#описание-моделей)
- [Application Structure](#application-structure) | [Структура приложения](#структура-приложения)
## ENG

### Description

Pocket Micro is a web application that allows users to visualize and interact with microeconomics and game theory
concepts. It is designed to be used as a teaching aid for students and teachers of economics. The application is built
using JavaScript and is hosted on GitHub Pages.

### Stack

- JavaScript
- HTML
- CSS
- Figma (for design)

### Site Structure

The site consists of a main page with a list of topics. Each topic is a link to a separate page with a visualization of
the concept.

### Interaction

Interaction with all models is similar and is done by changing parameters in the left panel. The right panel contains a
table where users can specify parameters of participants in the model and see the results. Some models come with
additional visualizations of the results in the form of graphs.

### Models Description

#### Nash Equilibrium

The Nash equilibrium visualization is implemented for 2 agents. It has pre-made presets depicting various possible
outcomes. For custom settings, users can specify the number of possible strategies for each agent, then click the "
Create/Clean" button to create a table with input fields to specify the payoffs for each strategy. After that, users can
click the "RUN" button to see the results of the model.

The iteration process is accompanied by the visualization of all the steps in the resulting table. Each step is numbered
and also displayed in the right zone of the page with comments for each step. The final result forming the Nash
equilibrium is highlighted in green. Users have the ability to pause or resume the iteration process, as well as to go
to the next or previous step or go to a specific step by entering the corresponding value in the step input field or via
the slider.

#### Serial Dictatorship

The serial dictatorship algorithm is very simple by its nature. Users specify the number of agents and the number of
objects. Then, users can specify the preferences of each agent for each object, either automatically or manually. The
algorithm is run by clicking the "RUN" button. The result is displayed in the right zone of the page as a table with the
allocation of objects to agents. The process of the algorithm is also displayed in the table with values. The final
allocation is highlighted in green.

#### House Allocation Problem (Top Trading Cycle)

Users can add or remove agents by clicking the "Add/Remove Participant" buttons. Users can specify the initial endowment
of each agent and preferences over the houses, either automatically or manually. The algorithm is run by clicking the "
RUN" button. The visualization is represented by an SVG canvas with a graph of the allocation process. The final
allocation is displayed there as well as in the table.

### Application Structure

- `index.html` - main page of the application with navigation to all the models
- `pages` - contains all the pages with visualization of the models
    - `nash_equilibrium.html` - page with visualization of Nash equilibrium model
    - `serial_dictatorship.html` - page with visualization of Serial dictatorship model
    - `house_allocation.html` - page with visualization of House allocation problem model
- `css` - contains all the styles for the web pages
- `console`
    - `nash_console.js` - way to interact with Nash equilibrium model via the console
- `data_sample`
    - `nash_data` - contains an example of data for Nash equilibrium model for console interaction
- `images` - contains all the images used in the application
- `scripts` - contains all the Classes and functions for the models
    - `nash_table.js` - class for the Nash equilibrium model
    - `graph_utils.js` - class representing graph structure
    - `svgObjects.js` - functions for creating SVG objects
- `browser` - contains all the scripts for the browser interaction
    - `nash_web.js` - script for the Nash equilibrium model including all logic and interaction
    - `serial_dic_web.js` - script for the serial dictatorship model including all logic and interaction
    - `house_alloc_web.js` - script for the house allocation model including all logic and interaction

---

## RUS

### [English Version](#eng)
### [Навигация](#Navigation)
### Описание

Pocket Micro - это веб-приложение, позволяющее пользователям визуализировать и взаимодействовать с концепциями
микроэкономики и теории игр. Оно разработано для использования в качестве учебного пособия для студентов и
преподавателей экономики. Приложение построено на JavaScript и размещено на GitHub Pages.

### Технологии

- JavaScript
- HTML
- CSS
- Figma (для дизайна)

### Структура сайта

Сайт состоит из главной страницы со списком тем. Каждая тема является ссылкой на отдельную страницу с визуализацией
концепции.

### Взаимодействие

Взаимодействие со всеми моделями схожее и осуществляется путем изменения параметров в левой панели. Правая панель
содержит таблицу, где пользователи могут указывать параметры участников модели и видеть результаты. Некоторые модели
сопровождаются дополнительной визуализацией результатов в виде графа.

### Описание моделей

#### Равновесие Нэша

Визуализация равновесия Нэша реализована для 2 агентов. Она имеет готовые предустановки, изображающие различные
возможные исходы. Для настройки пользователь может указать количество возможных стратегий для каждого агента, затем
нажать кнопку "Создать/Очистить", чтобы создать таблицу с полями для ввода, чтобы указать выплаты для каждой стратегии.
После этого пользователь может нажать кнопку "Запуск", чтобы увидеть результаты модели.

Процесс итерации сопровождается визуализацией всех шагов в результирующей таблице. Каждый шаг пронумерован и также
отображается в правой зоне страницы с комментариями к каждому шагу. Конечный результат, формирующий равновесие Нэша,
выделен зеленым цветом. Пользователь имеет возможность приостановить или возобновить процесс итерации, а также перейти к
следующему или предыдущему шагу или к конкретному шагу, введя соответствующее значение в поле ввода шага или с помощью
ползунка.

#### Серийная диктатура

Алгоритм серийная диктатуры очень прост по своей природе. Пользователь указывает количество агентов и количество
объектов. Затем пользователь может указать предпочтения каждого агента для каждого объекта, автоматически или вручную.
Алгоритм запускается нажатием кнопки "Запуск". Результат отображается в правой зоне страницы в виде таблицы с
распределением объектов между агентами. Процесс алгоритма также отображается в таблице со значениями. Окончательное
распределение выделено зеленым цветом.

#### Проблема распределения домов (Топологический цикл обмена)

Пользователь может добавлять или удалять агентов, нажимая кнопки "Добавить/Удалить участника". Пользователь может
указать начальное наделение каждого агента и предпочтения по домам, автоматически или вручную. Алгоритм запускается
нажатием кнопки "Запуск". Визуализация представлена в виде SVG-канвы с графом процесса распределения. Окончательное
распределение отображается там же, а также в таблице.

### Структура приложения

- `index.html` - главная страница приложения с навигацией по всем моделям
- `pages` - содержит все страницы с визуализацией моделей
    - `nash_equilibrium.html` - страница с визуализацией модели равновесия Нэша
    - `serial_dictatorship.html` - страница с визуализацией модели серийной диктатуры
    - `house_allocation.html` - страница с визуализацией проблемы распределения домов
- `css` - содержит все стили для веб-страниц
- `console`
    - `nash_console.js` - способ взаимодействия с моделью равновесия Нэша через консоль
- `data_sample`
    - `nash_data` - содержит пример данных для модели равновесия Нэша для взаимодействия через консоль
- `images` - содержит все изображения, используемые в приложении
- `scripts` - содержит все классы и функции для моделей
    - `nash_table.js` - класс для модели равновесия Нэша
    - `graph_utils.js` - класс, представляющий графовую структуру
    - `svgObjects.js` - функции для создания SVG-объектов
- `browser` - содержит все скрипты для взаимодействия через браузер
    - `nash_web.js` - скрипт для модели равновесия Нэша, включая всю логику и взаимодействие
    - `serial_dic_web.js` - скрипт для модели сериальной диктатуры, включая всю логику и взаимодействие
    - `house_alloc_web.js` - скрипт для модели распределения домов, включая всю логику и взаимодействие

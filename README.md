# Тестовое задание для 3205.team

Сервис асинхронной проверки списка URL.

Приложение принимает список URL-ов, запускает задачу в бэкграунде, проверяет каждый URL `HEAD` запросом, и отображает процесс работы задачи в UI.

## Стек

### Бэкенд

- TypeScript
- NestJS
- In-memory хранилище

### Фронтенд

- TypeScript
- React
- Vite
- Zustand

### Инфраструктура

- Docker
- Docker Compose

## Структура проекта

```txt
.
├── backend
│   └── src
│       └── modules
│           └── jobs
│               ├── application
│               ├── domain
│               ├── dto
│               ├── mappers
│               ├── jobs.controller.ts
│               ├── jobs.service.ts
│               ├── jobs.store.ts
│               └── jobs.processor.ts
├── frontend
│   └── src
│       ├── api
│       ├── components
│       ├── helpers
│       ├── hooks
│       └── store
├── docker-compose.yml
└── tsconfig.base.json
```

## Запуск через Docker Compose

Из корня проекта:

```bash
docker compose up --build
```

Фронтенд:

```txt
http://localhost:5173
```

Бэкенд:

```txt
http://localhost:3000/api
```

Остановить контейнеры:

```bash
docker compose down
```

## Локальный запуск

### Бэкенд

```bash
cd backend
npm install
npm run start:dev
```

Сервер будет исполняться на:

```txt
http://localhost:3000/api
```

### Фронтенд

В другом терминале:

```bash
cd frontend
npm install
npm run dev
```

Приложение будет доступно на:

```txt
http://localhost:5173
```

## Пример URL-ов для проверки

В проекте есть файл с готовыми URL-ами для ручной проверки:

```txt
frontend/samples/urls.txt
```

Их можно скопировать и вставить в форму на фронтенде. В списке есть как доступные URL-ы, так и URL-ы, которые должны завершиться ошибкой, чтобы было проще проверить разные статусы задачи.

## Архитектура

### Бэкенд

```txt
Controller
  -> валидирует объекты request DTO
  -> вызывает JobsService

JobsService
  -> создает задачу (job) в JobsStore
  -> запускает асинхронную обработку в JobsProcessor
  -> возвращает jobId немедленно

JobsProcessor
  -> обрабатывает URL-адреса задачи в фоновом режиме
  -> запускает до 5 одновременных проверок URL-адресов на одну задачу
  -> выполняет запросы HEAD
  -> поддерживает отмену с помощью AbortController
  -> записывает результаты проверки URL обратно в JobsStore

JobsStore
  -> хранит задачи в памяти
  -> обновляет статусы задач и проверок URL-адресов
  -> возвращает подробные сведения о задачах
```

### Фронтенд

```txt
CreateJobForm
  -> отправляет URL-ы на сервер

Zustand store
  -> вызывает API сервера
  -> хранит список задач, активную выбранную задачу и состояния загрузки/ошибок

useActiveJobPolling
  -> подтягивает информацию о выбранной задаче
  -> при смене активной задачи прекращает запросы для неактуальной задачи
```

## API

Base URL:

```txt
http://localhost:3000/api
```

### Создание задачи (job)

```http
POST /jobs
```

Request body:

```json
{
  "urls": ["https://example.com", "https://github.com"]
}
```

Response:

```json
{
  "jobId": "job-id"
}
```

### Получить задачи (jobs)

```http
GET /jobs
```

Возвращает список задач.

### Получение детальной информации по задаче

```http
GET /jobs/:id
```

Возвращает детальную информацию по задаче.

### Отмена задачи

```http
DELETE /jobs/:id
```

Отменяет задание. Уже обработанные проверки URL-адресов остаются сохраненными. Ожидающие проверки URL-адресов помечаются как отмененные. Активные запросы прерываются через AbortController, если они еще не завершились.

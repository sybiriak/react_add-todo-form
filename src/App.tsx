import './App.scss';
import { TodoList } from './components/TodoList';

import usersFromServer from './api/users';
import todosFromServer from './api/todos';
import { useState } from 'react';
import { Todo, User } from './types';

function getNewId(todos: Todo[]): number {
  return Math.max(...todos.map(todo => todo.id)) + 1;
}

function getUser(id: number): User | undefined {
  return usersFromServer.find(user => user.id === id);
}

const baseTodos: Todo[] = todosFromServer.map(todo => ({
  ...todo,
  user: getUser(todo.userId),
}));

const defaultFormValues = {
  title: '',
  userId: 0,
};

type FormValues = typeof defaultFormValues;
type FormErrors = Partial<Record<keyof FormValues, boolean>>;

export const App = () => {
  const [todos, setTodos] = useState<Todo[]>(baseTodos);
  const [formValues, setFormValues] = useState<FormValues>(defaultFormValues);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  function handleChange(
    event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) {
    const { name, value } = event.target;

    setFormValues(currentValues => ({
      ...currentValues,
      [name]: value,
    }));
    setFormErrors({ ...formErrors, [name]: false });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const userId = +formValues.userId;
    const title = formValues.title.trim();

    if (!userId || !title) {
      setFormErrors({
        title: !title,
        userId: !userId,
      });

      return;
    }

    setTodos([
      ...todos,
      {
        id: getNewId(todos),
        title,
        completed: false,
        userId,
        user: getUser(userId),
      },
    ]);

    setFormValues(defaultFormValues);
    setFormErrors({});
  }

  return (
    <div className="App">
      <h1>Add todo form</h1>

      <form action="/api/todos" method="POST" onSubmit={handleSubmit}>
        <div className="field">
          <input
            name="title"
            type="text"
            data-cy="titleInput"
            placeholder="Enter a title"
            value={formValues.title}
            onChange={handleChange}
          />
          {formErrors.title && (
            <span className="error">Please enter a title</span>
          )}
        </div>

        <div className="field">
          <select
            name="userId"
            data-cy="userSelect"
            value={formValues.userId}
            onChange={handleChange}
          >
            <option value="0" disabled>
              Choose a user
            </option>
            {usersFromServer.map(user => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>

          {formErrors.userId && (
            <span className="error">Please choose a user</span>
          )}
        </div>

        <button type="submit" data-cy="submitButton">
          Add
        </button>
      </form>

      <TodoList todos={todos} />
    </div>
  );
};

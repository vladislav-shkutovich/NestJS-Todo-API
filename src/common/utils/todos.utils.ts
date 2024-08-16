import { Todo } from '../../todos/schemas/todos.schema'

export const getLastUserTodos = (
  todos: Todo[],
  newTodo: Todo,
  todosCount = 5,
) => {
  const isNewTodoExist = todos.some((todo) => todo._id.equals(newTodo._id))
  const lastIndex = isNewTodoExist ? todosCount - 1 : todosCount - 2

  todos = todos.reduce(
    (todos, todo, index) => {
      if (index > lastIndex) return todos
      if (todo._id.equals(newTodo._id)) return todos
      todos.push(todo)
      return todos
    },
    [newTodo],
  )

  return todos
}

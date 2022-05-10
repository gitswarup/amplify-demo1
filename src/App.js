import { Component } from 'react';
import Amplify, { API, graphqlOperation } from 'aws-amplify';

import { withAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

import { createTodo, deleteTodo } from "./graphql/mutations";
import { listTodos } from './graphql/queries';

import awsExports from './aws-exports';
Amplify.configure(awsExports);

class AddTodo extends Component {
  constructor(props) {
    super(props);
    this.state = { name: '' };
  }

  handleChange = (event) => {
    this.setState({ name: event.target.value });
  }

  handleClick = () => {
    this.props.addTodo(this.state);
    this.setState({ name: '' });
  }

  render() {
    return (
      <div style={styles.form}>
        <input
          value={this.state.name}
          onChange={this.handleChange}
          placeholder="New Todo"
          style={styles.input}
        />
        <button onClick={this.handleClick} style={styles.addButton}>Add Todo</button>
      </div>
    );
  }
}

class TodoList extends Component {
  render() {
    return (
      <div>
        {this.props.todos.map(todo =>
          <div key={todo.id} style={styles.todo}>
            <p>{todo.name}</p>
            <button onClick={() => { this.props.deleteTodo(todo) }} style={styles.deleteButton}>x</button>
          </div>
        )}
      </div>
    );
  }
}

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { todos: [] };
  }

  async componentDidMount() {
    var result = await API.graphql(graphqlOperation(listTodos));
    this.setState({ todos: result.data.listTodos.items });
  }

  deleteTodo = async (todo) => {
    const id = {
      id: todo.id
    };
    await API.graphql(graphqlOperation(deleteTodo, { input: id }));
    this.setState({ todos: this.state.todos.filter(item => item.id !== todo.id) });
  }

  addTodo = async (todo) => {
    var result = await API.graphql(graphqlOperation(createTodo, { input: todo }));
    this.state.todos.push(result.data.createTodo);
    this.setState({ todos: this.state.todos });
  }

  render() {
    return (
      <div style={styles.container}>
        <h1>Todo App</h1>
        <AddTodo addTodo={this.addTodo} />
        <TodoList todos={this.state.todos} deleteTodo={this.deleteTodo} />
        <button onClick={this.props.signOut}>Sign out</button>
      </div>
    );
  }
}

export default withAuthenticator(App);

const styles = {
  container: { width: 480, margin: '0 auto', padding: 20 },
  form: { display: 'flex', marginBottom: 15 },
  input: { flexGrow: 2, border: 'none', backgroundColor: '#ddd', padding: 12, fontSize: 18 },
  addButton: { backgroundColor: 'black', color: 'white', outline: 'none', padding: 12, fontSize: 18 },
  todo: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 22, marginBottom: 15 },
  deleteButton: { fontSize: 18, fontWeight: 'bold' }
}
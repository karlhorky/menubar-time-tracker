import React, {Component} from 'react';

export default class LoginForm extends Component {
  onSubmit = () => {
    console.log('submitted') ||
    console.log('username', this.refs.username.value) ||
    console.log('password', this.refs.password.value);
  }

  render () {
    return (
      <form onSubmit={this.onSubmit}>
        <input ref="username" />
        <input ref="password" type="password" />
        <button type="submit">Submit</button>
      </form>
    )
  }
}

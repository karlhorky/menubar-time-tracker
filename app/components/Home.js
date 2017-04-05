// @flow
import React, { Component } from 'react';
import { Link } from 'react-router';
import styles from './Home.css';

import LoginForm from './LoginForm';

export default class Home extends Component {
  render() {
    return (
      <div className={styles.container} data-tid="container">
        <header>
        </header>
        <LoginForm />
        <Link to="/counter">to Counter</Link>
      </div>
    );
  }
}

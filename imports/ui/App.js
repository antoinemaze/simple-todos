import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';

 import { Tasks } from '../api/tasks.js';

 import Task from './Task.js';
 import AccountsUIWrapper from './AccountsUIWrapper.js';


 // App component - represents the whole app
class App extends Component {

  constructor(props) {
    super(props);
    this.state = {
      hideCompleted: false,
    };
  }

   handleSubmit(event) {
    event.preventDefault();
    // Find the text field via the React ref

    console.log("Text !!!!! " + this.refs.textInput.value);
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();

/*
    Tasks.insert({
      text,
      createdAt: new Date(), // current time
      owner: Meteor.userId(),           // _id of logged in user
      username: Meteor.user().username,  // username of logged in user
    });
*/

    // Update App component to use tasks.insert method
    Meteor.call('tasks.insert', text);

    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }

  renderTasks() {
//    return this.props.tasks.map((task) => (
//      <Task key={task._id} task={task} />

    //renderTasks function to filter out completed
    //tasks when this.state.hideCompleted is true
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => {
      //<Task key={task._id} task={task} />
      const currentUserId = this.props.currentUser && this.props.currentUser._id;
      const showPrivateButton = task.owner === currentUserId;

      return (
        <Task
          key={task._id}
          task={task}
          showPrivateButton={showPrivateButton}
        />
      );
    });
  }

  render() {
   return (
     <div className="container">
       <header>
         <h1>Todo List</h1>

         <label className="hide-completed">
           <input
             type="checkbox"
             readOnly
             checked={this.state.hideCompleted}
             onClick={this.toggleHideCompleted.bind(this)}
           />
           Hide Completed Tasks
         </label>

         <AccountsUIWrapper />

         <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
           <input
             type="text"
             ref="textInput"
             placeholder="Type to add new tasks"
           />
         </form>

{/*
         { this.props.currentUser ?
           <form className="new-task" onSubmit={this.handleSubmit.bind(this)} >
             <input
               type="text"
               ref="textInput"
               placeholder="Type to add new tasks"
             />
           </form> : ''
         }
*/}
       </header>
        <ul>
         {this.renderTasks()}
       </ul>
     </div>
   );
  }
}

export default withTracker(() => {
  Meteor.subscribe('tasks');

  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
//    tasks: Tasks.find({}).fetch
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
    currentUser: Meteor.user(),
  };
})(App);

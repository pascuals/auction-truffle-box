import React, { Component } from "react";

class TestamentList extends Component {
  state = { testaments: [] };

  constructor(props) {
    super(props);
    this.setState({ testaments: this.props.testaments });
  }

  componentDidMount = async () => {
  };

  render() {

    return (
      <div>
        {
          this.state.testaments.map(testament =>
            <div>{testament}</div>
          )
        }
      </div>

    );
  }
}

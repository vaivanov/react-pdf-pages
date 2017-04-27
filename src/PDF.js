import React, { Component } from 'react';

function buildPages(file) {
  let arr = [];
  for (let i = 1; i <= file.numPages; i++)
    arr.push({
      key: i,
      file
    });
  return arr;
}

export default class PDF extends Component {
  task = null;
  loadedUrl = null;
  file = null;
  error = null;
  loaded = 0;
  total = 100;

  static propTypes = {
    onProgress: React.PropTypes.func,
    onComplete: React.PropTypes.func,
    onError: React.PropTypes.func,
    url: React.PropTypes.string.isRequired,
    style: React.PropTypes.object,
    className: React.PropTypes.string
  };

  onProgress(progressData) {
    if (progressData.total) {
      this.loaded = progressData.loaded;
      this.total = progressData.total;

      if (typeof this.props.onProgress === 'function')
        this.props.onProgress(progressData);
    }
  }

  loadPDF() {
    // Destroy any old file
    if (this.file)
        this.file.destroy();

    // Cancel any old task
    if (this.task)
      this.task.onProgress = () => null;

    // Clear this instance
    this.loadedUrl = this.props.url;
    this.error = null;
    this.loaded = 0;
    this.total = 0;
    this.file = null;

    // Load the PDF
    const task = window.PDFJS.getDocument(this.props.url);
    task.onProgress = this.onProgress.bind(this);

    this.task = task;

    return task
      .then(file => {
        // Return if this task has been replaced by a new one
        if (task !== this.task)
          return;

        this.file = file;
        if (typeof this.props.onComplete === 'function')
          this.props.onComplete(buildPages(file));
      })
      .catch(error => {
        // Return if this task has been replaced by a new one
        if (task !== this.task)
          return;

        this.error = error;
        if (typeof this.props.onError === 'function')
          this.props.onError(error);
      });
  }

  componentDidUpdate() {
    if (this.props.url != this.loadedUrl)
      this.loadPDF();
  }

  componentDidMount() {
    this.loadPDF();
  }

  componentWillUnmount() {
    if (this.file)
      this.file.destroy();
  }

  render() {
    return (
      <div style={this.props.style} className={this.props.className}>
        {this.props.children}
      </div>
    );
  }
}

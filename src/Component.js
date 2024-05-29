export class Component {
  // 给类 Component 添加一个静态属性
  static isReactComponent = true;

  constructor(props) {
    this.props = props;
  }
}

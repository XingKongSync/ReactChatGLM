import { Layout, Space, Button, Input, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import "./App.css"
import ChatBubble from "./Controls/ChatBubble.js"
import HorizontalAlignCenter from "./Controls/HorizontalAlignCenter.js"
import React from 'react';
// import { fetchEventSource } from '@microsoft/fetch-event-source';

const { Header, Footer, Content } = Layout;
const { TextArea } = Input;

class App extends React.Component {

  constructor(props) {
    super(props);
    this.state = { isLoading: true, inputText: '', chatlog: [] };
    this.hasLoaded = false;
    this.session = "";
    this.chatlog = [];
    this.postData = this.postData.bind(this);
    this.getData = this.getData.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSendBtnClick = this.handleSendBtnClick.bind(this);
    this.handlePressEnter = this.handlePressEnter.bind(this);
    this.contentRef = React.createRef();
  }

  async postData(url = '', data = {}) {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return response.json();
  }

  async getData(url = '') {
    const response = await fetch(url);
    return response.json();
  }

  componentDidMount() {
    if (!this.hasLoaded) {
      message.loading("正在创建会话...", 0)
      //启动时获取 session
      this.getData('/api/session').then(data => {
        this.session = data.session;
        this.setState({ isLoading: false });
        message.destroy();
      })
    }
    this.hasLoaded = true;
  }

  componentDidUpdate() {
    this.contentRef.current.scrollTop = this.contentRef.current.scrollHeight;
  }

  handleInputChange(event) {
    this.setState({ inputText: event.target.value })
  }

  handlePressEnter(event) {
    if (!event.shiftKey) {
      event.preventDefault();
      this.handleSendBtnClick();
    }
  }

  handleSendBtnClick() {
    if (!this.state.inputText) {
      return;
    }

    this.chatlog.push({
      user: true,
      message: this.state.inputText
    });

    this.setState({ chatlog: this.chatlog, isLoading: true, inputText: '' });
    message.loading("AI 正在思考...", 0);

    // this.doChat.bind(this)();
    this.doStreamChat.bind(this)();
  }

  doStreamChat() {
    this.chatlog.push({ user: false, message: '' })
    let eventSource = new EventSource("/api/streamchat?session=" + this.session + "&prompt=" + this.state.inputText);
    eventSource.onerror = event => {
      eventSource.close();
      message.destroy();
      this.setState({ isLoading: false });
    }
    eventSource.onmessage = event => {
      let msgLog = this.chatlog.pop();
      msgLog.message = JSON.parse(event.data).message;
      this.chatlog.push(msgLog);
      this.setState({ chatlog: this.chatlog });
      // console.log(msgLog.message);
    }

    // await fetchEventSource("/api/streamchat", {
    //   method: 'POST',
    //   headers: {
    //     "Content-Type": "application/json"
    //   },
    //   body: JSON.stringify({ prompt: this.state.inputText, session: this.session }),
    //   onmessage: function (event) {
    //     console.log(event.data);
    //     let msgLog = this.chatlog.pop();
    //     msgLog.message = event.data;
    //     this.chatlog.push(msgLog);
    //     this.setState({ chatlog: this.chatlog });
    //   }.bind(this),
    //   onerror: function (event) {
    //     message.destroy();
    //     this.setState({ isLoading: false })
    //   }.bind(this),
    //   onclose: function (event) {
    //     message.destroy();
    //     this.setState({ isLoading: false })
    //   }.bind(this)
    // })
  }

  doChat() {
    this.postData('/api/chat', {
      prompt: this.state.inputText,
      session: this.session
    }).then(data => {
      message.destroy();
      let msg = '';
      if (data.code == 0) {
        msg = data.response;
      } else {
        msg = data.message;
      }
      this.chatlog.push({ user: false, message: msg });
      this.setState({ isLoading: false, chaglog: this.chatlog });
    }).catch(err => {
      message.destroy();
      message.error(err, 0);
    })
  }

  render() {
    const chatItems = this.state.chatlog.map((log, index) => {
      if (log.user) {
        return <ChatBubble key={index + ''} type="right" msg={log.message} />
      } else {
        return <ChatBubble key={index + ''} type="left" msg={log.message} />
      }
    });

    return (
      <Layout style={{ height: "100%" }}>
        <Header style={{ position: 'sticky', top: 0, zIndex: 1, width: '100%', height: '64px' }}>
          <p style={{ color: 'white', fontSize: 25, lineHeight: '64px', margin: 0 }}>ChatGLM</p>
        </Header>
        <Content style={{ overflow: "auto" }} ref={this.contentRef}>
          <HorizontalAlignCenter maxWidth="800px">
            {chatItems}
          </HorizontalAlignCenter>
        </Content>
        <Footer style={{ position: 'sticky', bottom: 0 }}>
          <HorizontalAlignCenter maxWidth="800px">
            <Space.Compact style={{ width: '100%' }}>
              <TextArea placeholder="输入内容，与 AI 开始对话吧！" value={this.state.inputText} onChange={this.handleInputChange} onPressEnter={this.handlePressEnter} autoSize />
              <Button disabled={this.state.isLoading} type="primary" icon={<SendOutlined />} style={{ width: 60 }} onClick={this.handleSendBtnClick}></Button>
            </Space.Compact>
          </HorizontalAlignCenter>
        </Footer>
      </Layout>
    );
  }
}

export default App;

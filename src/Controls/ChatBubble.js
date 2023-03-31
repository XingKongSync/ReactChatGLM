import { Col, Row, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import "./ChatBubble.css"
import "./github.css"
import showdown from 'showdown'
import showdownHighlight from 'showdown-highlight';

function ChatBubble(props) {
    const converter = new showdown.Converter({extensions: [showdownHighlight]});
    let html = converter.makeHtml(props.msg);
    if (props.type === "left") {
        return (
            <Row align="top">
                <Col flex="10px" />
                <Col flex="none">
                    <Avatar style={{marginTop: "12px"}}>GLM</Avatar>
                </Col>
                <Col flex="none">
                    {/* <span className={"bubble-" + props.type}>{props.msg}</span> */}
                    <div className={"bubble-" + props.type} dangerouslySetInnerHTML={{ __html: html }}></div>
                </Col>
            </Row>
        )
    } else {
        return (
            <Row align="top">
                <Col flex="auto" />
                <Col flex="none">
                    <span className={"bubble-" + props.type}>{props.msg}</span>
                </Col>
                <Col flex="none">
                    <Avatar style={{marginTop: "12px"}} icon={<UserOutlined />} />
                </Col>
                <Col flex="10px" />
            </Row>
        )
    }
}

export default ChatBubble;
const { Socket } = require('dgram');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000  //=> 앞 헤로쿠 배포용/뒤 로컬포트
//const PORT2 = 5001; //포트를 서비스별로 분리가 가능
//예, 댓글 : 6000 reply.js, 게시판 :5500 board.js, 인증서비스:5002 login.js
//위 방식이 마이크로서비스(MSA)방식 입니다.

var app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  //.listen(PORT, () => console.log(`Listening on ${ PORT }`))

  //푸시기능, 차트 실시간 랜더링하는 소캣 앱 시작
  //http서버 객체를 생성시 app(epress) 프레임워크를 전달
  var http = require('http').createServer(app);
  //socket.io 소켓 통신 객체생성시 http를 객체로 전달
  var io = require('socket.io').listen(http);
  //.listen은 클라이언트에서 서버로 접속을 받기 위해 대기하는 명령
  http.listen(PORT, function(){
    console.log('앱이 시작 되었습니다.포트번호 : '+ PORT);
  });
  var jsonMsg= { msg : ''}; //io서버와 스프링간의 메세지 전송 담는 변수
  //.on함수는 클라이언트에서 서버로 소켓통신의 이벤트를 대기하는 명령
  io.on('connection', function(socket){
    console.log(socket.id + ' user 접속됨');
    io.emit('OnOff', jsonMsg); // 스프링의 model같은 역할-접속한 All 소켓에  OnOff 변수명으로  msg를 전송 

    //client가 접속을 끊었을 때 
      //위 아래 결과 확인은 http://localhost:5000/socket.io/socket.io.js 이 소스를 사용
      socket.on('disconnect',function(){
      console.log(socket.id + ' user 접속 끊어짐')
    });
    socket.on('OnOff', function(jsonMsg){//1:1통신 받은 내용
      console.log('클라이언트에서 소켓으로 받은 메세지는 '+jsonMsg.msg);
      jsonMsg = {msg:jsonMsg.msg}
      if(jsonMsg.msg == 'updateRender'){
        io.emit('OnOff', jsonMsg);//1:다 통신으로 보냅니다.
      }
    });
  });


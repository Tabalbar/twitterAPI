import React, {useEffect, useState} from 'react'
import openSocket from 'socket.io-client'

var socket = openSocket('http://localhost:5000', {transports: ['websocket']})

function App() {

const [tweets, setTweets] = useState([])

  useEffect(() => {
    socket.on('latest tweets', mapTweetsToState)
  },[])

  const mapTweetsToState = (tweet) => {
    setTweets(prev=>[...prev, tweet])
  }

  const stopStreaming = () => {
    socket.emit('stop stream', () => { });

  }
const startStreaming = () => {
  socket.emit('start stream', () => { });
}

  // const callApi = async () => {
  //   const response = await fetch('http://localhost:5000/api/hello');
  //   const body = await response.json();
  //   console.log(body)
  //   if (response.status !== 200) throw Error(body.message);
    
  //   return body;
  // };
  
  return (
    <>
        <button onClick={startStreaming}>Start Stream</button>
        <button onClick={stopStreaming}>Stop Stream</button>      <div>
          {tweets.map((tweet) => {
            return (
              <div>
                <p>{tweet.user}</p>
                <p>{tweet.text}</p>
                <p>************************</p>
              </div>
            )
          })}
        </div>
    </>
  );
}

export default App;

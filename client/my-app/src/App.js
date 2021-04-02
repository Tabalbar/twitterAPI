import React, { useEffect, useState } from 'react'
import openSocket from 'socket.io-client'
import Graph from 'react-graph-vis'
import { T } from 'lodash/fp'

var socket = openSocket('http://localhost:5000', { transports: ['websocket'] })

function App() {

  const [tweets, setTweets] = useState([])
  const [graph, setGraph] = useState({
    nodes: [],
    edges: []
  })
  // const [count, setCount] = useState(0)
  // const [secondCount, setSecondCount] = useState(1000)

  useEffect(() => {
    socket.on('latest tweets', mapTweetsToState)
  }, [])
let count = 0;


  const mapTweetsToState = (tweet) => {
    if(tweet){
      setTweets(prev => [...prev, tweet])
      const node = {
        label: tweet.user,
        id: graph.nodes.length,
        title: tweet.text
      }
  
      if (tweet.retweetedPerson.name === '') {
        let tmpGraph = graph
        tmpGraph.nodes.push(node)
        setGraph(tmpGraph)
  
      } else {
  
        let found = false;
        let index = 0
        for (let i = 0; i < graph.nodes.length; i++) {
          if (graph.nodes[i].label === tweet.retweetedPerson.name) {
            found = true;
            index = i
            break;
          }
        }
        if (found) {
          let tmpGraph = graph
          tmpGraph.nodes.push(node)
          tmpGraph.edges.push({ from: graph.nodes.length, to: index })
          setGraph(tmpGraph)
        } else {
          let tmpGraph = graph
          tmpGraph.nodes.push(node)
          // setGraph(tmpGraph)
          let newNode = {
            id: tmpGraph.nodes.length,
            label: tweet.retweetedPerson.name,
            title: tweet.text
  
          }
          tmpGraph.nodes.push(newNode)
          tmpGraph.edges.push({ from: graph.nodes.length, to: graph.nodes.length+1 })
          setGraph(tmpGraph)
        }
      }
      count+=1;
    }


  }

  const stopStreaming = () => {
    socket.emit('stop stream', () => { });

  }
  const startStreaming = () => {
    socket.emit('start stream', () => { });
  }
  const options = {
    layout: {
      hierarchical: false
    },
    edges: {
      color: "#000000"
    },
    height: "1000"
  };
  const events = {
    click: function (event) {
      var { nodes, edges } = event;
      console.log(nodes)
    }
  };

  const forceUpdateHandler = () => {
    this.forceUpdate()
  }
  // const callApi = async () => {
  //   const response = await fetch('http://localhost:5000/api/hello');
  //   const body = await response.json();
  //   console.log(body)
  //   if (response.status !== 200) throw Error(body.message);

  //   return body;
  // };


console.log(graph)
  return (
    <>
      <button onClick={startStreaming}>Start Stream</button>
      <button onClick={stopStreaming}>Stop Stream</button>      
      {/* <button onClick={forceUpdateHandler}>Stop Stream</button>       */}

      <div>
        {tweets.map((tweet) => {
          return (
            <div>
              {/* <p>{tweet.user} {tweet.retweetedPerson.name === ''? null:'retweeted'} {tweet.retweetedPerson.name}</p>
                <p>{tweet.text}</p>
                <p>************************</p> */}
            </div>
          )
        })}
      </div>
      <Graph
        graph={graph}
        options={options}
        events={events}
        getNetwork={network => {
          //  if you want access to vis.js network api you can set the state in a parent component using this property
          console.log(network)
        }}
      />
    </>
  );
}

export default App;

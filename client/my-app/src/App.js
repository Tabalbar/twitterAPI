import React, { useEffect, useState } from 'react'
import openSocket from 'socket.io-client'
import Graph from 'react-graph-vis'

var socket = openSocket('http://localhost:5000', { transports: ['websocket'] })

function App() {

  const [tweets, setTweets] = useState([])
  const [graph, setGraph] = useState({
    nodes: [],
    edges: []
  })
  // const [count, setCount] = useState(0)
  // const [secondCount, setSecondCount] = useState(1000)


  let count = 0;


  const mapTweetsToState = (tweet) => {
    if (tweet) {
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

        let foundRetweetedPerson = false;
        let foundTweetedPerson = false;
        let retweetedIndex;
        let tweetedIndex;

        for (let i = 0; i < graph.nodes.length; i++) {
          if (graph.nodes[i].label === tweet.retweetedPerson.name) {
            foundRetweetedPerson = true;
            retweetedIndex = i
            break;
          }
        }
        for (let i = 0; i < graph.nodes.length; i++) {
          if (graph.nodes[i].label === tweet.user) {
            foundTweetedPerson = true;
            tweetedIndex = i;
            break;
          }
        }

        let tmpGraph = graph;

        if (foundTweetedPerson) {
          if (foundRetweetedPerson) {
            tmpGraph.edges.push({ from: tweetedIndex, to: retweetedIndex })
          } else {
            let newNode = {
              label: tweet.retweetedPerson.name,
              id: tmpGraph.nodes.length,
              title: tweet.text
            }
            tmpGraph.nodes.push(newNode)
            tmpGraph.edges.push({ from: tweetedIndex, to: tmpGraph.nodes.length })
          }
        } else {
          if (foundRetweetedPerson) {

            const node = {
              label: tweet.user,
              id: tmpGraph.nodes.length,
              title: tweet.text
            }
            tmpGraph.nodes.push(node)
            tmpGraph.edges.push({ from: tmpGraph.nodes.length, to: retweetedIndex })
          } else {

            const node = {
              label: tweet.user,
              id: tmpGraph.nodes.length,
              title: tweet.text
            }
            tmpGraph.nodes.push(node)
            let newNode = {
              label: tweet.retweetedPerson.name,
              id: tmpGraph.nodes.length,
              title: tweet.text
            }
            tmpGraph.nodes.push(newNode)
            tmpGraph.edges.push({ from: tmpGraph.nodes.length - 1, to: tmpGraph.nodes.length })
          }
        }
        setGraph(tmpGraph)

      }
      count += 1;
    }


  }
  useEffect(() => {
    socket.on('latest tweets', mapTweetsToState)
  }, [])
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


  const exportNetwork = (e) => {
    console.log('here')

    createNetworkFile(tweets)

  }


  console.log(graph)
  return (
    <>
      <button onClick={() => exportNetwork()}>Download Network</button>

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
        improvedLayout={false}
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

function createNetworkFile(tweets) {
  let nodes = [];
  let edges = []
  for( let i in tweets){
    if (tweets[i].retweetedPerson.name === '') {
      nodes.push({id: tweets[i].id, name: tweets[i].user, text: tweets[i].text, location: tweets[i].location, followers: tweets[i].followers, timestamp: tweets[i].timestamp})
  
    } else {
      nodes.push({id: tweets[i].retweetedPerson.id, name: tweets[i].retweetedPerson.name, text: tweets[i].text, location: tweets[i].retweetedPerson.location, followers: tweets[i].retweetedPerson.followers, timestamp: tweets[i].retweetedPerson.timestamp})
      edges.push({source: tweets[i].id, target: tweets[i].retweetedPerson.id})
    }
  }

  let network = {
    nodes: nodes,
    edges: edges
  }
  

  const element = document.createElement("a");
  network = JSON.stringify(network)
  const file = new Blob([network], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = "twitter_network.json";
  document.body.appendChild(element); // Required for this to work in FireFox
  element.click();
}
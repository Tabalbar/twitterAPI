const twit = require('twit')

var T = new twit({
    consumer_key: 'aTh11jaEiQf295BivoKw1GCkr',
    consumer_secret: 'WtCfgzycOzNeXceNR42hCPqb8A1Bb5rVv0KwviFaHUivFB6gc6',
    access_token: '1161632035-VryYFCfEsxybe3KK8nAztx4FGXz2I9JNIg0bvEZ',
    access_token_secret: 'qWqq882FT5H6clsRX43f0coBc6s5Bu17yOybNIeqndONV',
    timeout_ms: 60*1000,
    strictSSL: true,
});

let stream = T.stream('statuses/filter', {track: 'Japan'})
let isStreamStopped = false;
function getTweetObject(tweet) {
    let tweetText = (tweet.extended_tweet) ? tweet.extended_tweet.full_text : tweet.text;

    // check for retweets
    if (tweet.text.includes('RT @') && tweet.retweeted_status) {
        tweetText = (tweet.retweeted_status.extended_tweet) ? tweet.retweeted_status.extended_tweet.full_text : tweet.retweeted_status.text;
    }

    let TweetObject = {
        text: tweetText,
        user: tweet.user.name,
        location: (tweet.user.location !== null) ? tweet.user.location : '',
        followers: tweet.user.followers_count,
        userImage: tweet.user.profile_image_url,
        timestamp: tweet.timestamp_ms,
    };

    return TweetObject;
}

module.exports = (io) => {
    io.on('connection', function (socket) {
        console.log('sockets connected');

        socket.on('start stream', () => {
            console.log('started streaming tweets');

            stream.on('tweet', function (tweet) {
                console.log('tweeting');

                let TweetObject = getTweetObject(tweet);
                socket.emit('latest tweets', TweetObject);
            });
            stream.start();
            isStreamStopped = false;
        })
    }) 
}
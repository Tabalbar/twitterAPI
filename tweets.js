const twit = require('twit')

var T = new twit({
    consumer_key: 'aTh11jaEiQf295BivoKw1GCkr',
    consumer_secret: 'WtCfgzycOzNeXceNR42hCPqb8A1Bb5rVv0KwviFaHUivFB6gc6',
    access_token: '1161632035-VryYFCfEsxybe3KK8nAztx4FGXz2I9JNIg0bvEZ',
    access_token_secret: 'qWqq882FT5H6clsRX43f0coBc6s5Bu17yOybNIeqndONV',
    timeout_ms: 60 * 1000,
    strictSSL: true,
});
var hawaiiHonoulu = ['-170.97', '12.09', '-142.68', '33.96']
// let stream = T.stream('statuses/filter', {locations: hawaiiHonoulu})
let stream = T.stream('statuses/filter', { track: ['#OCD', '#PTSD', '#schizophernia', '#psychotic', '#anorexia', 'bulimia', ''] })

let isStreamStopped = false;
function getTweetObject(tweet) {
    let tweetText = (tweet.extended_tweet) ? tweet.extended_tweet.full_text : tweet.text;
    let retweetedPerson = {id: '', name: '', followers_count: 0, }
    // check for retweets "RT @"

    if (tweet.text.includes('@') && tweet.retweeted_status) {
        console.log(tweet)
        tweetText = (tweet.retweeted_status.extended_tweet) ? tweet.retweeted_status.extended_tweet.full_text : tweet.retweeted_status.text;
        retweetedPerson.name = (tweet.retweeted_status) ? tweet.retweeted_status.user.name : ''
        retweetedPerson.id = (tweet.retweeted_status) ? tweet.retweeted_status.user.id : ''
        retweetedPerson.timestamp = (tweet.retweeted_status) ? tweet.retweeted_status.created_at : ''
        retweetedPerson.followers = (tweet.retweeted_status) ? tweet.retweeted_status.user.followers_count : ''
        retweetedPerson.location = (tweet.retweeted_status) ? tweet.retweeted_status.user.location : ''
        tweetText = tweet.text
        let TweetObject = {
            text: tweetText,
            id: tweet.user.id,
            user: tweet.user.screen_name,
            retweetedPerson: retweetedPerson,
            location: (tweet.user.location !== null) ? tweet.user.location : '',
            followers: tweet.user.followers_count,
            timestamp: tweet.created_at,
        };
    
        return TweetObject;
    } else {
        return false
    }


  

}

module.exports = (io) => {
    io.on('connection', function (socket) {
        console.log('sockets connected');
        socket.on('stop stream', () => {
            console.log('stopped streaming tweets');
            stream.stop();
            isStreamStopped = true;
        });

        socket.on('restart stream', () => {
            console.log('restarted streaming tweets');
            stream.start();
            isStreamStopped = false;
        });
        socket.on('start stream', () => {
            console.log('started streaming tweets');

            stream.on('tweet', function (tweet) {
                console.log('tweeting');
                // console.log(tweet)

                let TweetObject = getTweetObject(tweet);
                socket.emit('latest tweets', TweetObject);
            });
            stream.start();
            isStreamStopped = false;
        })
    })
}
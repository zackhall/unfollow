# unfollow
An npm tool to unfollow twitter accounts. 

## Setup
You will need valid Twitter developer credentials in the form of a set of consumer and access tokens/keys. You can get these by creating a new app [here](https://apps.twitter.com/).

You must set the follwing environment variables from the app created in the previous step:
- TWT_CONSUMER_KEY
- TWT_CONSUMER_SECRET
- TWT_ACCESS_TOKEN,
- TWT_ACCESS_TOKEN_SECRET


Now, install the package: 

`npm install -g unfollow`



## Usage

Options:

  -u, --user   twitter username to unfollow
  
  -s, --stale  conditionally unfollow users whose data is stale by n days
  
  -h, --help   Show help

### Examples
  The following command will unfollow the specific user:
  
  `unfollow --user @cnn`

  The following command will prompt you to unfollow all users who have no new content in the last 365 days:
  
  `unfollow --stale 365`
  

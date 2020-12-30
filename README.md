### CHAT API

Chat API built with Node.js, MongoDB, and SocketIO. Checkout [ChatApp](https://github.com/mjabubakar/chatapp/) to see how you can integrate the API with your frontend.

#### Features

-   Real time updates using SocketIO.
-   Image upload with google cloud storage.
-   User authentication using JWT.
-   Realtime messages with SocketIO.

#### Installation

1. Clone project
   `git clone https://github.com/mjabubakar/chatapi`
2. cd into folder
   `cd ./chatapi/`
3. Download dependencies
   `npm install`
4. `npm start` to start your node server


#### Environmental Variables

-   `ACCESS_TOKEN_SECRET` JWT encryption secret for user login.
-   `GCLOUD_PROJECT_ID` Google cloud project id
-   `GCLOUD_FILE_PATH` key.json path
-   `GCLOUD_CRED` All data inside key.json file. Make sure all of it is on a single line.
-   `GCLOUD_STORAGE_BUCKET_URL` Storage bucket url
-   `FRONTEND_URL` Only the URL that CORS should accept
-   `URI` URL that connects your MongoDB cluster to your application
-   `PORT` determines which port the server is listening on
export const SERVER=process.env.REACT_APP_SERVER || 'stage'
export const LINK=`be-${SERVER}-scoby.scoby.dev/graphql`
export const SCOBY_LINK=`https://${LINK}`
export const WEBSOCKET_URL = `wss://${LINK}`;
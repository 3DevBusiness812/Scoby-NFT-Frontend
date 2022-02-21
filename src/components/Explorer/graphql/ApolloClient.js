/* import {ApolloClient, ApolloLink, Observable} from '@apollo/client';
import {SCOBY_LINK, WEBSOCKET_URL} from 'src/config/env';
import {createUploadLink} from 'apollo-upload-client';
import {WebSocketLink} from '@apollo/client/link/ws';
import {split} from 'apollo-link';
import {getMainDefinition} from '@apollo/client/utilities';
import {InMemoryCache} from '@apollo/client/cache';
import {onError} from 'apollo-link-error';

const userSessionErrors = ['ERR_JWT_INVALID_OR_EXPIRED', 'ERR_UNAUTHORIZED'];

export default function useApolloClient() {
  
    const uploadLink = createUploadLink({
      uri: SCOBY_LINK,
    });
  
    const wsLink = new WebSocketLink({
      uri: WEBSOCKET_URL,
      options: {
        reconnect: true,
      },
    });
  
    const splitLink = split(
      ({query}) => {
        const definition = getMainDefinition(query);
        return definition.kind === 'OperationDefinition' && definition.operation === 'subscription';
      },
      wsLink,
      uploadLink,
    );
  
    const errorLink = onError(({response, graphQLErrors = [], operation, forward}) => {
      if (userSessionErrors.includes(graphQLErrors[0]?.extensions?.code)) {
        response.expiredToken = true;
      }
      return forward(operation);
    });
  
    const requestLink = new ApolloLink(
      (operation, forward) =>
        new Observable((observer) => {
              const subscriber = {
                next: observer.next.bind(observer),
                error: observer.error.bind(observer),
                complete: observer.complete.bind(observer),
              };
              forward(operation).subscribe(subscriber);
        }),
    );
  
    return new ApolloClient({
      link: ApolloLink.from([requestLink, errorLink, splitLink]),
      cache: new InMemoryCache(),
    });
  }
   */
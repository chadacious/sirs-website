import { ApolloClient } from 'apollo-client';
import { createHttpLink } from 'apollo-link-http';
import { InMemoryCache } from 'apollo-cache-inmemory';

const { REACT_APP_SIRSCALE_BASE_URL, REACT_APP_SIRSCALE_API_PATH } = process.env;
const sirsHttpLink = createHttpLink({ uri: REACT_APP_SIRSCALE_BASE_URL + REACT_APP_SIRSCALE_API_PATH, credentials: 'include' });

export default new ApolloClient({
    link: sirsHttpLink,
    cache: new InMemoryCache(),
});
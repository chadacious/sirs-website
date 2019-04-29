import gql from 'graphql-tag';
import { AuthClient } from '@medlor/medlor-core-lib';
import { GetAuthenticatedUserId, LogOut } from '@medlor/medlor-auth-lib';
import * as initialState from './initialState';

const getUserQuery = gql`
    query ($id: Int!) {
        getUser(id: $id) {
            id
            firstName
            lastName
            email
            activeProfileId
            activeProfile {
                id
                userId
                name
                dateOfBirth
                avatarUrl
                Permissions {
                    name
                    accessLevel
                }
            }
            Profiles {
                id
                userId
                name
                dateOfBirth
                avatarUrl
            }
        }
    }
`;

export const loadUser = fetchPolicy => (
    new Promise((resolve, reject) => {
        GetAuthenticatedUserId(
            localStorage.getItem('medlor-token'),
            localStorage.getItem('medlor-refreshToken')
        ).then(async (userId) => {
            if (userId > 0) {
                AuthClient.query({
                    query: getUserQuery,
                    variables: { id: userId },
                    fetchPolicy: !fetchPolicy ? 'cache-first' : fetchPolicy,
                }).then((response) => {
                    resolve(response.data.getUser);
                }).catch((error) => {
                    /** if we experience an error here, then it is indicating that the user in the token is
                     * not found at the server. So we are in an unstable state and should logout to clear out
                     * the invalid access tokens.
                     */
                    LogOut();
                    reject(error);
                });
            } else {
                /* There was no authenticated user */
                reject(new Error('No authenticated user'));
            }
        });
    })
);

export const logOut = () => (
    new Promise((resolve) => {
        LogOut();
        resolve(initialState.user);
    })
);

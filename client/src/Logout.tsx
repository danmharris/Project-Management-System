import * as React from 'react';

import CookieService from './service/cookie';

class Logout extends React.Component {
    public render() {
        CookieService.clear();
        window.location.replace('/');

        return (
            <h1>Logging out...</h1>
        );
    }
}

export default Logout;

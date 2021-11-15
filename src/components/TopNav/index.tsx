import React, {ReactElement, useCallback, useEffect, useState} from "react";
import Icon from "../Icon";
import classNames from "classnames";
import "./top-nav.scss"
import {Route, Switch, useHistory, useLocation, useParams} from "react-router";
import Web3Button from "../Web3Button";
import {
    useAccount,
    useGunLoggedIn,
    useSemaphoreID,
} from "../../ducks/web3";
import {useDispatch} from "react-redux";
import {fetchAddressByName, useUser} from "../../ducks/users";
import Web3 from "web3";
import {getName} from "../../util/user";
import {useSelectedLocalId} from "../../ducks/worker";
import {fetchNameByAddress} from "../../util/web3";
import Logo from "../../../static/icons/favicon.png";

export default function TopNav(): ReactElement {
    const account = useAccount();
    const loggedIn = useGunLoggedIn();
    const semaphoreId = useSemaphoreID();

    const showRegisterInterrepButton = !loggedIn && account && semaphoreId.commitment && !semaphoreId.identityPath;

    return (
        <div
            className={classNames(
                'bg-white flex-shrink-0',
                'flex', 'flex-row', 'flex-nowrap', 'items-center',
                'border-b border-gray-200',
                'top-nav'
            )}
        >
            <div
                className={classNames(
                    "flex flex-row flex-nowrap items-center flex-grow flex-shrink-0",
                )}
            >
                <Switch>
                    <Route path="/explore" component={DefaultHeaderGroup} />
                    <Route path="/home" component={DefaultHeaderGroup} />
                    <Route path="/tag/:tagName" component={TagHeaderGroup} />
                    <Route path="/:name/status/:hash" component={PostHeaderGroup} />
                    <Route path="/post/:hash" component={PostHeaderGroup} />
                    <Route path="/create-local-backup" component={DefaultHeaderGroup} />
                    <Route path="/signup" component={DefaultHeaderGroup} />
                    <Route path="/notification" component={DefaultHeaderGroup} />
                    <Route path="/:name" component={UserProfileHeaderGroup} />
                    <Route>
                        <DefaultHeaderGroup />
                    </Route>
                </Switch>
            </div>
            <div
                className="flex flex-row flex-nowrap items-center flex-grow-0 flex-shrink-0 mx-4 h-20 mobile-hidden"
            >
                <NavIconRow />
                <Web3Button
                    className={classNames("rounded-xl top-nav__web3-btn border border-gray-200")}
                />
            </div>
        </div>
    );
}

function NavIconRow() {
    const loggedIn = useGunLoggedIn();
    const account = useAccount();
    const selectedLocalId = useSelectedLocalId();
    const [ensName, setEnsName] = useState('');

    let address = '';

    if (loggedIn) {
        address = selectedLocalId?.address || account;
    }

    useEffect(() => {
        (async () => {
            const ens = await fetchNameByAddress(address);
            setEnsName(ens);
        })();
    }, [address]);

    return (
        <div
            className={classNames(
                "flex flex-row flex-nowrap items-center flex-shrink-0",
                "rounded-xl border border-gray-100",
                "p-1 mx-4 overflow-hidden",
                "bg-white",
                'mobile-hidden',
            )}
        >
            <TopNavIcon fa="fas fa-home" pathname="/home" disabled={!loggedIn} />
            <TopNavIcon fa="fas fa-user" pathname={`/${ensName || address}/`} disabled={!loggedIn} />
            <TopNavIcon fa="fas fa-globe-asia" pathname="/explore" />
            {/*<TopNavIcon fa="fas fa-bell" pathname="/notifications" />*/}
        </div>
    )
}

function DefaultHeaderGroup() {
    const loggedIn = useGunLoggedIn();
    const account = useAccount();
    const selectedLocalId = useSelectedLocalId();
    const [ensName, setEnsName] = useState('');

    let address = '';

    if (loggedIn) {
        address = selectedLocalId?.address || account;
    }

    useEffect(() => {
        (async () => {
            const ens = await fetchNameByAddress(address);
            setEnsName(ens);
        })();
    }, [address]);

    return (
        <div
            className={classNames(
                "flex flex-row flex-nowrap items-center flex-shrink-0",
                "p-1 mx-4 overflow-hidden",
                "bg-white",
            )}
        >
            <Icon
                url={Logo}
                size={2}
            />
        </div>
    )
}

function UserProfileHeaderGroup() {
    const {name} = useParams<{ name: string }>();
    const [username, setUsername] = useState('');

    const dispatch = useDispatch();
    const user = useUser(username);

    useEffect(() => {
        (async () => {
            if (!Web3.utils.isAddress(name)) {
                const address: any = await dispatch(fetchAddressByName(name));
                setUsername(address);
            } else {
                setUsername(name);
            }
        })();
    }, [name]);
    const history = useHistory();

    const goBack = useCallback(() => {
        if (history.action !== 'POP') return history.goBack();
        history.push('/');
    }, [history]);

    return (
        <div
            className={classNames(
                "flex flex-row flex-nowrap items-center flex-shrink-0",
                "rounded-xl p-1 mx-4 overflow-hidden",
                "bg-white profile-header-group",
            )}
        >
            <Icon
                className="w-8 h-8 flex flex-row items-center justify-center top-nav__back-icon"
                fa="fas fa-chevron-left"
                onClick={goBack}
            />
            <div
                className="flex flex-row flex-nowrap items-center px-2 py-2 profile-header-group__title-group"
            >
                <div
                    className="flex flex-col flex-nowrap justify-center ml-2"
                >
                    <div className="font-bold text-lg profile-header-group__title">
                        {getName(user)}
                    </div>
                    <div className="text-xs text-gray-500 profile-header-group__subtitle">
                        {user?.meta?.postingCount || 0} Posts
                    </div>
                </div>
            </div>
        </div>
    )
}

function TagHeaderGroup() {
    const history = useHistory();
    const {tagName} = useParams<{ tagName: string }>();
    const tag = decodeURIComponent(tagName);

    const goBack = useCallback(() => {
        if (history.action !== 'POP') return history.goBack();
        history.push('/');
    }, [history]);

    return (
        <div
            className={classNames(
                "flex flex-row flex-nowrap items-center flex-shrink-0",
                "rounded-xl p-1 mx-4 overflow-hidden",
                "bg-white tag-header-group",
            )}
        >
            <Icon
                className="w-8 h-8 flex flex-row items-center justify-center top-nav__back-icon"
                fa="fas fa-chevron-left"
                onClick={goBack}
            />
            <div
                className="flex flex-row flex-nowrap items-center px-2 py-2"
            >
                <div className="flex flex-col flex-nowrap justify-center ml-2">
                    <div className="font-bold text-xl tag-header-group__tag-text">
                        {tag}
                    </div>
                </div>
            </div>
        </div>
    )
}

function PostHeaderGroup() {
    const history = useHistory();

    const goBack = useCallback(() => {
        if (history.action !== 'POP') return history.goBack();
        history.push('/');
    }, [history]);

    return (
        <div
            className={classNames(
                "flex flex-row flex-nowrap items-center flex-shrink-0",
                "rounded-xl p-1 mx-4 overflow-hidden",
                "bg-white post-header-group",
            )}
        >
            <Icon
                className="w-8 h-8 flex flex-row items-center justify-center top-nav__back-icon"
                fa="fas fa-chevron-left"
                onClick={goBack}
            />
            <div
                className="flex flex-row flex-nowrap items-center px-2 py-2"
            >
                <div className="flex flex-col flex-nowrap justify-center ml-2">
                    <div className="font-bold text-xl top-nav__text-title">
                        Post
                    </div>
                </div>
            </div>
        </div>
    )
}

type TopNavIconProps = {
    fa: string;
    pathname: string;
    disabled?: boolean;
}

function TopNavIcon(props: TopNavIconProps): ReactElement {
    const history = useHistory();
    const {pathname} = useLocation();

    return (
        <Icon
            className={classNames(
                'flex', 'flex-row', 'items-center', 'justify-center',
                'top-nav__icon',
                {
                    'top-nav__icon--selected': pathname === props.pathname,
                    'top-nav__icon--disabled': props.disabled,
                }
            )}
            onClick={(pathname !== props.pathname && !props.disabled) ? () => history.push(props.pathname) : undefined}
            fa={props.fa}
            size={1.125}
        />
    )
}
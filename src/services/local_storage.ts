import { BigNumber } from '0x.js';

import { LIMIT_NUMBER_OF_NOTIFICATIONS } from '../common/constants';
import { Notification } from '../util/types';

const addPrefix = (key: string) => `0x-launch-kit-frontend.${key}`;

const notificationsKey = addPrefix('notifications');
const hasUnreadNotificationsKey = addPrefix('hasUnreadNotifications');
const lastBlockCheckedKey = addPrefix('lastBlockChecked');

export class LocalStorage {
    private readonly _storage: Storage;

    constructor(storage: Storage = localStorage) {
        this._storage = storage;
    }

    public saveNotifications(notifications: Notification[], account: string): void {
        const currentNotifications = JSON.parse(this._storage.getItem(notificationsKey) || '{}');

        const newNotifications = {
            ...currentNotifications,
            [account]: notifications,
        };

        // Sort array by timestamp property
        newNotifications[account] = newNotifications[account].sort((a: Notification, b: Notification) => {
            const aTimestamp = a != null && a.timestamp ? a.timestamp.getTime() : 0;
            const bTimestamp = b != null && b.timestamp ? b.timestamp.getTime() : 0;
            return bTimestamp - aTimestamp;
        });

        // Limit number of notifications
        if (newNotifications[account].length > LIMIT_NUMBER_OF_NOTIFICATIONS) {
            newNotifications[account].length = LIMIT_NUMBER_OF_NOTIFICATIONS;
        }

        this._storage.setItem(notificationsKey, JSON.stringify(newNotifications));
    }

    public getNotifications(account: string): Notification[] {
        const currentNotifications = JSON.parse(
            this._storage.getItem(notificationsKey) || '{}',
            (key: string, value: string) => {
                if (key === 'amount') {
                    return new BigNumber(value);
                }
                if (key === 'timestamp') {
                    return new Date(value);
                }
                if (key === 'tx') {
                    return Promise.resolve();
                }
                return value;
            },
        );

        return currentNotifications[account] || [];
    }

    public saveHasUnreadNotifications(hasUnreadNotifications: boolean, account: string): void {
        const currentStatuses = JSON.parse(this._storage.getItem(hasUnreadNotificationsKey) || '{}');

        const newStatuses = {
            ...currentStatuses,
            [account]: hasUnreadNotifications,
        };

        this._storage.setItem(hasUnreadNotificationsKey, JSON.stringify(newStatuses));
    }

    public getHasUnreadNotifications(account: string): boolean {
        const currentNotifications = JSON.parse(this._storage.getItem(hasUnreadNotificationsKey) || '{}');

        return currentNotifications[account] || false;
    }

    public saveLastBlockChecked(lastBlockChecked: number, account: string): void {
        const currentBlocks = JSON.parse(this._storage.getItem(lastBlockCheckedKey) || '{}');

        const newBlocks = {
            ...currentBlocks,
            [account]: lastBlockChecked,
        };

        this._storage.setItem(lastBlockCheckedKey, JSON.stringify(newBlocks));
    }

    public getLastBlockChecked(account: string): number {
        const currentLastBlockChecked = JSON.parse(this._storage.getItem(lastBlockCheckedKey) || '{}');

        return currentLastBlockChecked[account] || 0;
    }
}

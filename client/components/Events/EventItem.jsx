import React from 'react';
import PropTypes from 'prop-types';
import {get, pick} from 'lodash';
import {Label, InternalNoteLabel, Location} from '../';
import {EVENTS, MAIN, ICON_COLORS} from '../../constants';
import {Item, Border, ItemType, PubStatus, Column, Row, ActionMenu} from '../UI/List';
import {EventDateTime} from './';
import {ItemActionsMenu} from '../index';
import {
    eventUtils,
    getItemWorkflowStateLabel,
    getItemActionedStateLabel,
    onEventCapture,
    isItemPublic,
    isItemExpired,
    isItemDifferent,
} from '../../utils';
import {gettext} from '../../utils/gettext';


export class EventItem extends React.Component {
    shouldComponentUpdate(nextProps) {
        const original = pick(this.props, ['item', 'lockedItems', 'session']);
        const updates = pick(nextProps, ['item', 'lockedItems', 'session']);

        return isItemDifferent(original, updates);
    }

    render() {
        const {item, onItemClick, lockedItems, dateFormat, timeFormat,
            session, privileges, activeFilter, toggleRelatedPlanning, onMultiSelectClick} = this.props;

        if (!item) {
            return null;
        }

        const hasPlanning = eventUtils.eventHasPlanning(item);
        const isItemLocked = eventUtils.isEventLocked(item, lockedItems);
        const state = getItemWorkflowStateLabel(item);
        const actionedState = getItemActionedStateLabel(item);
        const hasLocation = !!get(item, 'location.name') ||
            !!get(item, 'location.formatted_address');
        const showRelatedPlanningLink = activeFilter === MAIN.FILTERS.COMBINED && hasPlanning;

        let borderState = false;

        if (isItemLocked)
            borderState = 'locked';
        else if (hasPlanning)
            borderState = 'active';

        const itemActionsCallBack = {
            [EVENTS.ITEM_ACTIONS.EDIT_EVENT.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.EDIT_EVENT.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.EDIT_EVENT_MODAL.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.EDIT_EVENT_MODAL.actionName].bind(null, item, true),
            [EVENTS.ITEM_ACTIONS.DUPLICATE.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.DUPLICATE.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.CREATE_PLANNING.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.CREATE_PLANNING.actionName],
            [EVENTS.ITEM_ACTIONS.CREATE_AND_OPEN_PLANNING.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.CREATE_AND_OPEN_PLANNING.actionName],
            [EVENTS.ITEM_ACTIONS.UNSPIKE.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.UNSPIKE.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.SPIKE.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.SPIKE.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.CANCEL_EVENT.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.CANCEL_EVENT.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.POSTPONE_EVENT.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.POSTPONE_EVENT.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.UPDATE_TIME.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.UPDATE_TIME.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.RESCHEDULE_EVENT.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.RESCHEDULE_EVENT.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.CONVERT_TO_RECURRING.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.CONVERT_TO_RECURRING.actionName].bind(null, item),
            [EVENTS.ITEM_ACTIONS.UPDATE_REPETITIONS.actionName]:
                this.props[EVENTS.ITEM_ACTIONS.UPDATE_REPETITIONS.actionName].bind(null, item),
        };
        const itemActions = eventUtils.getEventActions(item, session, privileges, lockedItems, itemActionsCallBack);
        const isExpired = isItemExpired(item);

        return (
            <Item
                shadow={1}
                activated={this.props.multiSelected}
                onClick={() => onItemClick(item)}
                disabled={isExpired}
            >
                <Border state={borderState} />
                <ItemType
                    item={item}
                    hasCheck={activeFilter !== MAIN.FILTERS.COMBINED}
                    checked={this.props.multiSelected}
                    onCheckToggle={onMultiSelectClick.bind(null, item)}
                    color={!isExpired && ICON_COLORS.DARK_BLUE_GREY}
                />
                <PubStatus item={item} isPublic={isItemPublic(item)}/>
                <Column
                    grow={true}
                    border={false}>
                    <Row>
                        <span className="sd-overflow-ellipsis sd-list-item--element-grow">
                            {item.slugline &&
                                    <span className="sd-list-item__slugline">{item.slugline}</span>
                            }
                            <InternalNoteLabel item={item} />
                            {item.name}
                        </span>
                        <EventDateTime
                            item={item}
                            dateFormat={dateFormat}
                            timeFormat={timeFormat}
                        />
                    </Row>
                    <Row>
                        {isExpired && (
                            <Label
                                text={gettext('Expired')}
                                iconType="alert"
                                isHollow={true}
                            />
                        )}
                        <Label
                            text={gettext(state.label)}
                            iconType={state.iconType}
                        />
                        {!!actionedState && <Label
                            onClick={(e) => {
                                onEventCapture(e);
                                onItemClick({
                                    _id: item.reschedule_from,
                                    type: 'event',
                                });
                            }}
                            text={gettext(actionedState.label)}
                            iconType={actionedState.iconType}
                        />}
                        {(showRelatedPlanningLink || hasLocation) &&
                            <span className="sd-overflow-ellipsis sd-list-item--element-grow">
                                {showRelatedPlanningLink &&
                                <a
                                    className="sd-line-input__input--related-item-link"
                                    onClick={toggleRelatedPlanning}
                                >
                                    <i className="icon-calendar" />
                                    {this.props.relatedPlanningText}
                                </a>}
                                {hasLocation && <Location
                                    name={get(item, 'location.name')}
                                    address={get(item, 'location.formatted_address')}
                                />}
                            </span>
                        }

                    </Row>
                </Column>
                {get(itemActions, 'length', 0) > 0 && <ActionMenu>
                    <ItemActionsMenu actions={itemActions} wide={true}/>
                </ActionMenu>}
            </Item>
        );
    }
}

EventItem.propTypes = {
    item: PropTypes.object.isRequired,
    onItemClick: PropTypes.func.isRequired,
    lockedItems: PropTypes.object.isRequired,
    dateFormat: PropTypes.string.isRequired,
    timeFormat: PropTypes.string.isRequired,
    session: PropTypes.object,
    privileges: PropTypes.object,
    activeFilter: PropTypes.string,
    toggleRelatedPlanning: PropTypes.func,
    relatedPlanningText: PropTypes.string,
    multiSelected: PropTypes.bool,
    onMultiSelectClick: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.DUPLICATE.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.CREATE_PLANNING.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.CREATE_AND_OPEN_PLANNING.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.SPIKE.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.UNSPIKE.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.CANCEL_EVENT.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.POSTPONE_EVENT.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.UPDATE_TIME.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.RESCHEDULE_EVENT.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.CONVERT_TO_RECURRING.actionName]: PropTypes.func,
    [EVENTS.ITEM_ACTIONS.UPDATE_REPETITIONS.actionName]: PropTypes.func,
};

EventItem.defaultProps = {
    togglePlanningItem: () => { /* no-op */ },
};

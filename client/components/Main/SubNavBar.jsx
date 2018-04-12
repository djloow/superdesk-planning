import React from 'react';
import PropTypes from 'prop-types';

import {MultiSelectActions} from '../index';
import {SearchBox, Button} from '../UI';
import {ActionsSubnavDropdown, CreateNewSubnavDropdown} from './index';
import {SubNav} from '../UI/SubNav';

import {gettext} from '../../utils';

export const SubNavBar = ({
    addEvent,
    addPlanning,
    openAgendas,
    value,
    search,
    activeFilter,
    createPlanningOnly,
    isViewFiltered,
    clearSearch,
    currentStartFilter,
    dateFormat,
}) => (
    <SubNav>
        <MultiSelectActions />
        <SearchBox label="Search planning" value={value} search={search} activeFilter={activeFilter}/>
        {isViewFiltered &&
        <Button
            text={gettext('Clear Filters')}
            className="btn__clear-filters"
            hollow={true}
            color="alert"
            onClick={clearSearch}
        />}
        <span className="subnav__page-title subnav__page-title--no-grow">
            {currentStartFilter.format(dateFormat)}
        </span>
        <ActionsSubnavDropdown openAgendas={openAgendas} />
        <CreateNewSubnavDropdown
            addEvent={addEvent}
            addPlanning={addPlanning}
            createPlanningOnly={createPlanningOnly}
        />
    </SubNav>
);

SubNavBar.propTypes = {
    addEvent: PropTypes.func.isRequired,
    addPlanning: PropTypes.func.isRequired,
    openAgendas: PropTypes.func.isRequired,
    value: PropTypes.string.isRequired,
    search: PropTypes.func.isRequired,
    activeFilter: PropTypes.string.isRequired,
    createPlanningOnly: PropTypes.bool,
    isViewFiltered: PropTypes.bool,
    clearSearch: PropTypes.func,
    currentStartFilter: PropTypes.object,
    dateFormat: PropTypes.string,
};

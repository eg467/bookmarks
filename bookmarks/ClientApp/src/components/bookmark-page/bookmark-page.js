import React from 'react';
import TagFilterPage from '../tags/TagFilterPage';
import BookmarkBlocks from "./bookmark-blocks/bookmark-blocks";
export default () => {
    return (React.createElement("div", null,
        React.createElement(TagFilterPage, null),
        React.createElement(BookmarkBlocks, null)));
};

import React from 'react'
import BookmarkBlocks from "./bookmark-blocks/bookmark-blocks";
import TagFilterPage from '../../components/filters/tag-filter-page';

export default () => {
    return (
        <div>
            <TagFilterPage />
            <BookmarkBlocks />
        </div>
    )
};
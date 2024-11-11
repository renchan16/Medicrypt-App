/**
 * Card Component
 *
 * The `Card` component serves as a flexible container that can hold various types 
 * of content. It provides a styled wrapper with rounded corners and configurable 
 * width and height, allowing for a consistent layout across the application. 
 * This component enhances UI design by encapsulating content in a visually appealing 
 * card-like format.
 *
 * Props:
 * -------
 * @param {string} width - CSS class name for the width of the card. Defaults to 'w-full' 
 *                         for full-width cards.
 * @param {string} height - CSS class name for the height of the card. Defaults to 'h-full' 
 *                          for full-height cards.
 * @param {ReactNode} children - The content to be rendered inside the card. 
 *
 * Styles:
 * -------
 * - The card has rounded corners with a radius of 18px.
 * - The card has minimum dimensions of 200px width and 150px height to ensure 
 *   adequate space for its content.
 *
 * Usage:
 * ------
 * The `Card` component can be used to display a variety of content, such as 
 * images, text, or buttons, within a defined area, enhancing visual organization 
 * and user engagement.
 *
 * Example:
 * -------
 * <Card width="w-1/2" height="h-60">
 *   <h2 className="text-lg">Card Title</h2>
 *   <p>This is a sample card content.</p>
 * </Card>
 *
 * Dependencies:
 * -------------
 * - React: Core library for component rendering.
 *
 * Code Author:
 * ------------
 * - Renz Carlo T. Caritativo
 * 
 * Date Created:
 * Last Modified:
 */

import React from 'react';

const Card = ({ width = 'w-full', height = 'h-full', children }) => {
  return (
    <div
      className={`rounded-[18px] ${width} ${height}`}
      style={{ minWidth: '200px', minHeight: '150px' }}
    >
      {children}
    </div>
  );
};

export default Card;

DeuteriumLinkpage
=================

**A simple but highly configurable start page.**


Quick access your favorite and most used links via link cards. Add and remove link cards with ease.

### Available configuration options:

* Edit heading.
* Edit subheading.
* Change background image.
* Vertical center image.
* Change element color (blue | red | green).
* Change font color (Black | White).
* Enable/disable card sorting.
* Enable/disable edit mode.
* Save configuration to file.
* Load configuration from file.
* Reset configuration.
* Reset configuration and link cards.

### Screenshots:

Main:  
![Main](Screenshots/Deuterium2.png?raw=true)

Configuration:  
![Configuration](Screenshots/Config.png?raw=true)

Reset options:  
![Reset options](Screenshots/ConfigReset.png?raw=true)

New card:  
![New card](Screenshots/NewCard.png?raw=true)

Icon picker:  
![Icon picker](Screenshots/NewCardIcon.png?raw=true)

Edit mode:  
![Edit mode](Screenshots/EditMode.jpg?raw=true)

Sorting cards:  
![Sorting cards](Screenshots/Sorting.gif?raw=true)


### Built With

* [Bootstrap](https://getbootstrap.com)
* [JQuery](https://jquery.com)


## Notes

* Configurations are stored in the browsers local storage. An option to save the configuration to file is provided.
* The feature *'background image: `Add new`'* is not yet available. New images should be put manually to `/img`.
* Background image listing and selection, works only with `Apache` web server (for now). 
To change image, the appropriate `defaults` value in `script.js`, has to be edited. 
* The icon picker uses *Font Awesome* icons.


## License

This project is licensed under the 3-clause BSD license - see the [LICENSE](LICENSE) file for details

## Acknowledgments

* [Font Awesome](https://fontawesome.com/)
* [SortableJS](https://github.com/SortableJS/Sortable)
* [jquery-sortablejs](https://github.com/SortableJS/jquery-sortablejs)
* [fontawesome-iconpicker](https://github.com/farbelous/fontawesome-iconpicker)

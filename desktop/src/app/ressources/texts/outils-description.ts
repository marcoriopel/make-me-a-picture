import { Feature } from './feature';

export interface GroupFeature extends Feature {
    dependance: Feature[];
}

export const OTHER_FEATURES: Feature[] = [
    {
        name: 'Palette de couleur',
        description:
            'Cet outil permet de définir la couleur de tous les outils. Vous pouvez définir deux couleurs : principale et secondaire. Ces deux couleurs peuvent intéragir entre eux. Vous pouvez choisir la couleur avec le panneau de couleur contenant toutes les couleurs. En changeant de couleur, l ancienne couleur est enregistré pour vous permettre de la récupérer au besoin. ',
        picture: './../../../assets/img/couleur.PNG',
    },
];

export const UNDO_REDO: Feature[] = [
    {
        name: 'Annuler-refaire',
        description:
            "Cet outil permet d'annuler et de refaire vos dernières modifications sur la surface du dessin. IL est possible d'utiliser le raccourci CTRL + Z pour annuler une action et le raccourci CTRL + SHIFT + Z pour refaire une action.",
        picture: './../../../assets/img/Annuler.PNG',
    },
];

export const BASIC_TOOLS: Feature[] = [
    {
        name: 'Efface',
        description:
            'Cet outil permet d effacer tout ce qui se trouve sur la surface de dessin. Il peut avoir différente taille ce qui permet d effacer plus rapidement. ',
        picture: './../../../assets/video/efface.mp4',
    },
    {
        name: 'Ligne',
        description:
            "Cet outil permet de tracer une ligne composée d'un ou plusieurs segments. Un premier clic définit la position de départ de la ligne. Ensuite, chaque clic qui suit « connecte » avec le clic qui le précède pour former un segment de la ligne. Un double clic permet de terminer le segment. Si le double clic est fait près du point initial de la ligne, le segment se fusionnera au point initial. \nLa commande shifth permet de mettre la ligne a 90° ou 45°  de celle tracé précédemment. Il est possible d'afficher un point de jonction entre les segments en cliquant dans la boîte «Afficher jonction». La couleur des points de jonction est déterminée par la couleur secondaire.   ",
        picture: './../../../assets/video/ligne.mp4',
    },
    {
        name: 'Pipette',
        description:
            "Cet outil permet de sélectionner la couleur sous la souris. Un cercle de prévisualisation qui représente les pixels sous la souris surdimensionnés et qui entoure le pixel qui sera sélectionné est présenté dans la barre d'attribut. Un clic gauche change la couleur principal et un clic gauche la couleur secondaire",
        picture: './../../../assets/video/brush.mp4',
    },
];

export const DRAWING_TOOLS: Feature[] = [
    {
        name: 'Crayon',
        description:
            'Le crayon vous permet de tracer des traits simples. Il peut être de différente épaisseur. Vous pouvez changer la taille avec les boutons dans la barre a gauche',
        picture: './../../../assets/video/crayon.mp4',
    },
    {
        name: 'Pinceau',
        description:
            "Le pinceau permet de faire des traits de différente texture. Vous pouvez changer de texture en sélectionnant l'image correspondant à la texture désirée.",
        picture: './../../../assets/video/brush.mp4',
    },
];

export const SHAPES: Feature[] = [
    {
        name: 'Rectangle',
        description:
            'Cet outil permet de dessiner des rectangles de différente taille. Le rectangle tracé peut avoir un remplissage uni, juste un contour ou les deux. La couleur du remplissage est la couleur primaire et la couleur du contour est la couleur secondaire. Il est possible de faire un carré avec la commande shift.',
        picture: './../../../assets/video/rectangle.mp4',
    },
    {
        name: 'Ellipse',
        description:
            "Cet outil permet de dessiner des ellipses de différente taille. L'ellipse tracé peut avoir un remplissage complet et uni, juste un contour ou les deux. La couleur du remplissage est la couleur primaire et la couleur du contour est la couleur secondaire. Il est possible de faire un cercle parfait avec la commande shift.",
        picture: './../../../assets/video/ellipse.mp4',
    },
    {
        name: 'Polygone',
        description:
            'Cet outil permet de dessiner des polygones de différente taille. Le polygone tracé peut avoir un remplissage complet et uni, juste un contour ou les deux. La couleur du remplissage est la couleur primaire et la couleur du contour est la couleur secondaire. Il est possible de choisir le nombre de côté du polygone (3 à 12)',
        picture: './../../../assets/video/polygone.mp4',
    },
];

export const FILL: Feature[] = [
    {
        name: 'Sceau de peinture ',
        description: "Cet outil permet de remplir une région de la couleur principal. La tolérance définit l'étendue de la région à remplir.",
        picture: './../../../assets/video/remplissage.mp4',
    },
];

export const TRANSFORMATIONS: Feature[] = [
    {
        name: 'Déplacement par rectangle',
        description:
            "Cette fonctionnalité permet de sélection une section en forme de rectangle de la surface de dessin et de déplacer cette sélection avec la souris à l'aide d'un glisser-déposer avec le bouton gauche de la souris. ",
        picture: './../../../assets/video/selection_par_rectangle.mp4',
    },
    {
        name: 'Déplacement par ellipse',
        description:
            "Cette fonctionnalité permet de sélection une section en forme d'ellipse de la surface de dessin et de déplacer cette sélection avec la souris à l'aide d'un glisser-déposer avec le bouton gauche de la souris. ",
        picture: './../../../assets/video/selection_par_ellipse.mp4',
    },
    {
        name: 'Redimensionnement',
        description:
            'Cette fonctionnalité permet de redimensionner la surface de dessin sur sa hauteur, sa largeur ou les deux en même temps. Pour ce faire, la surface dispose de trois points de contrôles sur les extrémités de la surface. Il suffit de glisser et déposer avec le bouton gauche de la souris.',
        picture: './../../../assets/video/redimensionnement.mp4',
    },
];

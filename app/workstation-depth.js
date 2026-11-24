import { PlaneGeometry } from 'three';

export const workstationAspect = 1409 / 1116;

export function makeWorkstationRelief() {
  const map = document.createElement('canvas');
  map.width = 282;
  map.height = 223;
  const paint = map.getContext('2d', { willReadFrequently: true });
  paint.fillStyle = '#242424';
  paint.fillRect(0, 0, map.width, map.height);
  paint.scale(map.width / 1409, map.height / 1116);
  paint.filter = 'blur(2px)';

  function shape(depth, outline) {
    paint.fillStyle = `rgb(${depth} ${depth} ${depth})`;
    paint.fill(new Path2D(outline));
  }

  // Paint back to front in the reference image's pixel coordinates.
  shape(55, 'M755 370 Q820 294 974 332 L1097 522 Q1170 570 1200 900 L801 1006 662 829Z');
  shape(88, 'M1120 611 L1185 759 1218 916 1409 989 1409 1116 0 1116 0 836 186 762 674 829Z');
  shape(125, 'M0 935 Q309 969 568 941 L1070 928 1254 948 1409 1030 1409 1116 0 1116Z');
  shape(104, 'M852 511 Q799 564 789 622 L698 758 711 841 1002 877 1130 848 Q1171 672 1101 555 L1011 498Z');
  shape(133, 'M840 321 Q870 251 942 254 Q1032 254 1028 435 L1025 482 1070 507 Q1010 572 978 626 Q904 707 873 645 L817 524 781 488 829 419Z');
  shape(158, 'M851 351 Q881 292 943 309 Q1005 328 987 416 L996 474 969 581 Q924 652 886 602 L862 551 824 562 840 490 797 474 839 433Z');
  shape(161, 'M920 774 L898 903 821 937 808 899 815 778 Z M770 724 L811 679 882 717 899 780 783 829 702 846 681 802Z');
  shape(110, 'M534 824 L817 820 854 864 819 916 537 917 460 881Z');
  shape(161, 'M159 264 L713 246 750 747 670 787 634 876 583 899 567 921 343 1015 205 1015 190 990 232 897 165 820 124 571Z');
  shape(195, 'M157 276 L669 291 689 553 714 712 656 781 605 858 361 878 168 831 160 649 127 568Z');
  shape(222, 'M166 543 L345 528 437 588 461 752 423 812 357 849 201 835 161 783 157 606Z');

  paint.lineCap = 'round';
  paint.lineJoin = 'round';
  paint.strokeStyle = '#eeeeee';
  paint.lineWidth = 33;
  paint.stroke(new Path2D('M632 995 L580 321 L823 110 L950 145'));
  shape(235, 'M886 121 L966 123 1039 163 1090 224 1092 265 1023 267 875 177Z M518 1004 Q530 959 670 958 Q787 961 802 1016 Q756 1085 590 1080 Q524 1067 518 1004Z');
  shape(204, 'M800 954 L966 955 1107 999 1081 1051 801 1080 774 1028Z');
  shape(189, 'M810 781 Q852 765 925 785 L914 874 904 936 859 952 821 929Z');

  const depth = paint.getImageData(0, 0, map.width, map.height).data;
  const relief = new PlaneGeometry(workstationAspect, 1, 160, 128);
  const position = relief.attributes.position;
  const uv = relief.attributes.uv;
  for (let vertex = 0; vertex < position.count; vertex++) {
    const u = uv.getX(vertex);
    const v = uv.getY(vertex);
    const x = Math.round(u * (map.width - 1));
    const y = Math.round((1 - v) * (map.height - 1));
    const height = depth[(y * map.width + x) * 4] / 255;
    const edge = Math.min(1, u * 16, (1 - u) * 16, v * 16, (1 - v) * 16);
    position.setZ(vertex, (height - 0.14) * edge * 0.35);
  }
  return relief;
}

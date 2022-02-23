function MGRSString(Lat, Long) {
    if (Lat < -80) return 'Too far South';
    if (Lat > 84) return 'Too far North';
    var c = 1 + Math.floor((Long + 180) / 6);
    var e = c * 6 - 183;
    var k = Lat * Math.PI / 180;
    var l = Long * Math.PI / 180;
    var m = e * Math.PI / 180;
    var n = Math.cos(k);
    var o = 0.006739496819936062 * Math.pow(n, 2);
    var p = 40680631590769 / (6356752.314 * Math.sqrt(1 + o));
    var q = Math.tan(k);
    var r = q * q;
    var s = (r * r * r) - Math.pow(q, 6);
    var t = l - m;
    var u = 1.0 - r + o;
    var v = 5.0 - r + 9 * o + 4.0 * (o * o);
    var w = 5.0 - 18.0 * r + (r * r) + 14.0 * o - 58.0 * r * o;
    var x = 61.0 - 58.0 * r + (r * r) + 270.0 * o - 330.0 * r * o;
    var y = 61.0 - 479.0 * r + 179.0 * (r * r) - (r * r * r);
    var z = 1385.0 - 3111.0 * r + 543.0 * (r * r) - (r * r * r);
    var aa = p * n * t + (p / 6.0 * Math.pow(n, 3) * u * Math.pow(t, 3)) + (p / 120.0 * Math.pow(n, 5) * w * Math.pow(t, 5)) + (p / 5040.0 * Math.pow(n, 7) * y * Math.pow(t, 7));
    var ab = 6367449.14570093 * (k - (0.00251882794504 * Math.sin(2 * k)) + (0.00000264354112 * Math.sin(4 * k)) - (0.00000000345262 * Math.sin(6 * k)) + (0.000000000004892 * Math.sin(8 * k))) + (q / 2.0 * p * Math.pow(n, 2) * Math.pow(t, 2)) + (q / 24.0 * p * Math.pow(n, 4) * v * Math.pow(t, 4)) + (q / 720.0 * p * Math.pow(n, 6) * x * Math.pow(t, 6)) + (q / 40320.0 * p * Math.pow(n, 8) * z * Math.pow(t, 8));
    aa = aa * 0.9996 + 500000.0;
    ab = ab * 0.9996;
    if (ab < 0.0) ab += 10000000.0;
    var ad = 'CDEFGHJKLMNPQRSTUVWXX'.charAt(Math.floor(Lat / 8 + 10));
    var ae = Math.floor(aa / 100000);
    var af = ['ABCDEFGH', 'JKLMNPQR', 'STUVWXYZ'][(c - 1) % 3].charAt(ae - 1);
    var ag = Math.floor(ab / 100000) % 20;
    var ah = ['ABCDEFGHJKLMNPQRSTUV', 'FGHJKLMNPQRSTUVABCDE'][(c - 1) % 2].charAt(ag);

    function pad(val) {
        if (val < 10) {
            val = '0000' + val
        } else if (val < 100) {
            val = '000' + val
        } else if (val < 1000) {
            val = '00' + val
        } else if (val < 10000) {
            val = '0' + val
        };
        return val
    };
    aa = Math.floor(aa % 100000);
    aa = pad(aa);
    ab = Math.floor(ab % 100000);
    ab = pad(ab);
    return c + ad + ' ' + af + ah + ' ' + aa + ' ' + ab;
};


function IMGRSString(Lat, Long) {
    let PI = 3.1415926535;
    let GRID = "";
    Lat = Number(Lat);
    Long = Number(Long);
    if ((Lat >= 36.0) && (Lat <= 37.0) && (Long >= 60) && (Long <= 78)) {
        GRID = "Zero";
    }
    else {
        if ((Lat >= 29.0) && (Lat <= 36.0) && (Long >= 60) && (Long <= 81)) {
            GRID = "OneA"
        }
        else {
            if (Lat >= 28.0 && Lat <= 29.0 && Long >= 60 && Long <= 79) {
                GRID = "OneA"
            }
            else {
                if (Lat >= 28.0 && Lat <= 29.0 && Long >= 79 && Long <= 82) {
                    GRID = "TwoA"
                }
                else {
                    if (Lat >= 26.0 && Lat <= 28.0 && Long >= 82 && Long <= 83) {
                        GRID = "TwoA"
                    }
                    else {
                        if (Lat >= 22.0 && Lat <= 28.0 && Long >= 60 && Long <= 82) {
                            GRID = "TwoA"
                        }
                        else {
                            if (Lat >= 20.0 && Lat <= 22.0 && Long >= 60 && Long <= 72) {
                                GRID = "TwoA"
                            }
                            else {
                                if (Lat >= 22.5 && Lat <= 30.0 && Long >= 83 && Long <= 110) {

                                    GRID = "TwoB"
                                }
                                else {
                                    if (Lat >= 22.0 && Lat <= 22.5 && Long >= 85 && Long <= 93) {
                                        GRID = "TwoB"
                                    }
                                    else {
                                        if (Lat >= 21.0 && Lat <= 22.0 && Long >= 85 && Long <= 91) {
                                            GRID = "TwoB"
                                        }
                                        else {
                                            if (Lat >= 29.0 && Lat <= 30.0 && Long >= 81 && Long <= 82) {
                                                GRID = "TwoB"
                                            }
                                            else {
                                                if (Lat >= 28.0 && Lat <= 29.0 && Long >= 82 && Long <= 83) {
                                                    GRID = "TwoB"
                                                }
                                                else {
                                                    if (Lat >= 22.5 && Lat <= 26.0 && Long >= 82 && Long <= 83) {
                                                        GRID = "TwoB"
                                                    }
                                                    else {
                                                        if (Lat >= 15.0 && Lat <= 21.0 && Long >= 72 && Long <= 91) {
                                                            GRID = "ThreeA";
                                                        }
                                                        else {
                                                            if (Lat >= 21.0 && Lat <= 22.0 && Long >= 72 && Long <= 85) {
                                                                GRID = "ThreeA";
                                                            }
                                                            else {
                                                                if (Lat >= 8.0 && Lat <= 15.0 && Long >= 72 && Long <= 90) {
                                                                    GRID = "FourA"
                                                                }
                                                                else {
                                                                    GRID = "Zero"
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
        let  L_o = 0;
        let  lamda_o = 0;
        let  Sin_lamda_o = 0;
        let  Row_o = 0;
        let  F_o = 0;
        let  R_o = 0;
        let  A = "";
        let  B = "";
        let  C = "";
        let  FE = 0;
        let  FN = 0;

    if (GRID == 'Zero') {
        L_o = 68;
        lamda_o = 39.5;
        Sin_lamda_o = 0.63607823;
        Row_o = 6360575.909;
        F_o = 0.998462;
        R_o = 7734776.5;
        A = "2.43707E-16";
        B = "7.67308E-23";
        C = "2.8239E-30";
        FE = 2153866.4;
        FN = 2368292.9;
    }
    else {
        if (GRID == 'OneA') {
            L_o = 68;
            lamda_o = 32.5;
            Sin_lamda_o = 0.53729961;
            Row_o = 6353222.862;
            F_o = 0.99878640776699;
            R_o = 10007804.5;
            A = "2.43332E-16";
            B = "9.94054E-23";
            C = "3.18941E-30";
            FE = 2743196.4;
            FN = 914398.8;
        }
        else {
            if (GRID == 'TwoA') {
                L_o = 74;
                lamda_o = 26;
                Sin_lamda_o = 0.43837115;
                Row_o = 6347110.219;
                F_o = 0.998786;
                R_o = 13067874.3;
                A = "2.4302E-16";
                B = "1.29972E-24";
                C = "3.4641E-30";
                FE = 2743196.4;
                FN = 914398.8;
            }
            else {
                if (GRID == 'TwoB') {
                    L_o = 90;
                    lamda_o = 26;
                    Sin_lamda_o = 0.43837115;
                    Row_o = 6347110.219;
                    F_o = 0.998786;
                    R_o = 13067874.3;
                    A = "2.4302E-16";
                    B = "1.29972E-24";
                    C = "3.4641E-30";
                    FE = 2743196.4;
                    FN = 914398.8;
                }
                else {
                    if (GRID == 'ThreeA') {
                        L_o = 80;
                        lamda_o = 19;
                        Sin_lamda_o = 0.32556815;
                        Row_o = 6341661.253;
                        F_o = 0.998786;
                        R_o = 18505061.7;
                        A = "2.42742E-16";
                        B = "1.29972E-24";
                        C = "3.68927E-30";
                        FE = 2743196.4;
                        FN = 914398.8;
                    }
                    else {
                        if (GRID == 'FourA') {
                            L_o = 80;
                            lamda_o = 12;
                            Sin_lamda_o = 0.20791169;
                            Row_o = 6337697.261;
                            F_o = 0.998786;
                            R_o = 29970732.4;
                            A = "2.42539E-16";
                            B = "2.98703E-24";
                            C = "3.84255E-30";
                            FE = 2743196.4;
                            FN = 914398.8;
                        }
                    }
                }
            }
        }
    }
    let lamda = Lat;
    let L = Long;
    let a_small = 6377301.243;
    let e_2 = 0.006637846;
    let C_bar = (L - L_o) * Math.sin(lamda_o * (PI / 180))
    let P = (a_small * (1 - e_2)) / Math.pow((1 - e_2 * Math.pow(Math.sin(lamda * PI / 180), 2)), 1.5)
    let m = P * Math.sin((lamda - lamda_o) * PI / 180)
    //  j = m * m * m                                                                       
    //  k = j * m
    //  n = k * m
    // x = A * j                                                        
    // y = B * k                                                            
    // z = C * n                                                       
    // u = m + x + y + z
    let s = F_o * (m + A * Math.pow(m, 3) + B * Math.pow(m, 4) + C * Math.pow(m, 5))
    let Delta_E = (R_o - s) * Math.sin(C_bar * PI / 180)
    let Delta_N = s + Delta_E * Math.tan(0.5 * C_bar * PI / 180)
    let easting_str = FE + Delta_E
    let northing_str = FN + Delta_N
    let sEasting = easting_str.toString()
    let sNorthing = northing_str.toString()
    let i = 0
    let valEst = ""
    let valNorth = ""
    for (i = 3; i <= sEasting.length - 1; i++) {
        valEst = valEst + sEasting[i]
    }
    for (i = 3; i <= sNorthing.length - 1; i++) {
        valNorth = valNorth + sNorthing[i]
    }
    let new_str = GRID + "  E : " + valEst + "  N : " + valNorth
    return new_str;
};
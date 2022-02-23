
function IMGRSString(Lat, Long)
{ 
	let PI = 3.1415926535;
	let GRID = "";
	let GRID_OLD = "";
	// console.log(Lat+" / "+Long)

	Lat = Number(Lat);
	Long = Number(Long);

	if((Lat >= 36.0) && (Lat <= 37.0) && (Long >= 60) && (Long <= 78)){
		GRID = "Zero";

	}

	else{
		if((Lat >= 29.0) && (Lat <= 36.0) && (Long >= 60) && (Long <= 81)){
			GRID = "OneA"
		}
		else{
			if(Lat >= 28.0 && Lat <= 29.0 && Long >= 60 && Long <= 79){
				GRID = "OneA"
			}
			else{
				if(Lat >= 28.0 && Lat <= 29.0 && Long >= 79 && Long <= 82){
					GRID = "TwoA"
				}

				else{
					if (Lat >= 26.0 && Lat <= 28.0 && Long >= 82 && Long <= 83){
						GRID = "TwoA"

					} 
					else{
						if (Lat >= 22.0 && Lat <= 28.0 && Long >= 60 && Long <= 82){

							GRID = "TwoA"                                                                         
						}
						else{
							if (Lat >= 20.0 && Lat <= 22.0 && Long >= 60 && Long <= 72){

								GRID = "TwoA"
							} 

							else{
								if (Lat >= 22.5 && Lat <= 30.0 && Long >= 83 && Long <= 110){

									GRID = "TwoB"
								} 


								else{
									if (Lat >= 22.0 && Lat <= 22.5 && Long >= 85 && Long <= 93){

										GRID = "TwoB"
									} 

									else{
										if (Lat >= 21.0 && Lat <= 22.0 && Long >= 85 && Long <= 91){

											GRID = "TwoB"
										}  


										else{
											if (Lat >= 29.0 && Lat <= 30.0 && Long >= 81 && Long <= 82){

												GRID = "TwoB"
											} 
											else{

												if (Lat >= 28.0 && Lat <= 29.0 && Long >= 82 && Long <= 83){

													GRID = "TwoB"
												} 


												else{
													if (Lat >= 22.5 && Lat <= 26.0 && Long >= 82 && Long <= 83){

														GRID = "TwoB"
													} 

													else{

														if (Lat >= 15.0 && Lat <= 21.0 && Long >= 72 && Long <= 91){

															GRID = "ThreeA";
														} 

														else{
															if (Lat >= 21.0 && Lat <= 22.0 && Long >= 72 && Long <= 85){

																GRID = "ThreeA";
															} 

															else{
																if (Lat >= 8.0 && Lat <= 15.0 && Long >= 72 && Long <= 90){

																	GRID = "FourA"
																}
																else{
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



if(GRID == 'Zero'){
	L_o = 68;
	lamda_o =39.5;
	Sin_lamda_o =0.63607823;
	Row_o=6360575.909;
	F_o=0.998462;
	R_o=7734776.5;
	A="2.43707E-16";
	B ="7.67308E-23";
	C= "2.8239E-30";
	FE = 2153866.4;
	FN = 2368292.9;

	
}										
else{
	if(GRID == 'OneA'){
		L_o = 68;
		lamda_o =32.5;
		Sin_lamda_o =0.53729961;
		Row_o=6353222.862;
		F_o=0.99878640776699;
		R_o=10007804.5;
		A="2.43332E-16";
		B ="9.94054E-23";
		C= "3.18941E-30";
		FE = 2743196.4;
		FN = 914398.8;
	}
	else{
		if(GRID == 'TwoA'){
			L_o = 74;
			lamda_o =26;
			Sin_lamda_o =0.43837115;
			Row_o=6347110.219;
			F_o=0.998786;
			R_o=13067874.3;
			A="2.4302E-16";
			B ="1.29972E-24";
			C= "3.4641E-30";
			FE = 2743196.4;
			FN = 914398.8;

		}		
		else{
			if(GRID == 'TwoB'){
				L_o = 90;
				lamda_o =26;
				Sin_lamda_o =0.43837115;
				Row_o=6347110.219;
				F_o=0.998786;
				R_o=13067874.3;
				A="2.4302E-16";
				B ="1.29972E-24";
				C= "3.4641E-30";
				FE = 2743196.4;
				FN = 914398.8;

			}
			else{										
				if(GRID == 'ThreeA'){
					L_o = 80;
					lamda_o =19;
					Sin_lamda_o =0.32556815;
					Row_o=6341661.253;
					F_o=0.998786;
					R_o=18505061.7;
					A="2.42742E-16";
					B ="1.29972E-24";
					C= "3.68927E-30";
					FE = 2743196.4;
					FN = 914398.8;

				}
				else{										
					if(GRID == 'FourA'){
						L_o = 80;
						lamda_o =12;
						Sin_lamda_o =0.20791169;
						Row_o=6337697.261;
						F_o=0.998786;
						R_o=29970732.4;
						A="2.42539E-16";
						B ="2.98703E-24";
						C= "3.84255E-30";
						FE = 2743196.4;
						FN = 914398.8;
					}
				}
			}
		}
	}
}




lamda = Lat;
L = Long;



 a_small = 6377301.243;
            e_2 = 0.006637846 ; 
            C_bar = (L - L_o) * Math.sin(lamda_o * (PI / 180))
            P = (a_small * (1 - e_2)) / Math.pow((1 - e_2 * Math.pow(Math.sin(lamda * PI / 180), 2)), 1.5)
            m = P * Math.sin((lamda - lamda_o) * PI / 180)                                              

           //  j = m * m * m                                                                       
           //  k = j * m
           //  n = k * m
           // x = A * j                                                        
           // y = B * k                                                            
           // z = C * n                                                       
           // u = m + x + y + z
            s = F_o * (m + A * Math.pow(m, 3) + B * Math.pow(m, 4) + C * Math.pow(m, 5))                                                                                                   

            Delta_E = (R_o - s) * Math.sin(C_bar * PI / 180)
            Delta_N = s + Delta_E * Math.tan(0.5 * C_bar * PI / 180)         
            easting_str = FE + Delta_E                       
            northing_str = FN + Delta_N     
                       
            
               sEasting  =    easting_str.toString() 
               sNorthing  =    northing_str.toString() 
            i = 0   
            let valEst = "" 
            let valNorth = ""  
            for(i=3; i<= sEasting.length-1; i++) {
             valEst = valEst + sEasting[i]
            }
            for(i=3; i<= sNorthing.length-1; i++) {           
             valNorth = valNorth + sNorthing[i]
         }
            
           new_str =  GRID +  "  E :" + valEst + "  N :" + valNorth


// alert(new_str)




	return new_str;

}













using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;


namespace Race_Track.Models
{
    public class Piloto
    {
        public int PilotoId { get; set; }

        [Display(Name = "Nombre")]        
        public string? PilotoNombre {get; set;}
        
        [Display(Name = "Apellido")]        
        public string? PilotoApellido {get; set;}
        
        [Display(Name = "Dni")]        
        public int PilotoDni {get; set;}
        // public LicenciaType InstructorTipoLicencia { get; set; }
        [Display(Name = "Numero registro")]        
        public int PilotoNumeroLicencia {get; set;}
        [Display(Name = "Fecha de vencimiento")]        
        public DateTime PilotoExpedicion {get;set;}
        
        [Display(Name = "Es propietario?")]        
        public bool PilotoPropietario {get;set;} = true;       
        
        [Display(Name = "Vehiculo asignado")]
        public int VehiculoId { get; set; }          
        public virtual Vehiculo? Vehiculo { get; set; }        
    }
}
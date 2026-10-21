using System;
using System.Collections.Generic;

namespace TiendaOnline.API.Models;

public partial class escribir2
{
    public int id_calificacion { get; set; }

    public int id_servicio { get; set; }

    public string id_usuario { get; set; } = null!;

    public virtual calificacion id_calificacionNavigation { get; set; } = null!;

    public virtual servicio id_servicioNavigation { get; set; } = null!;

    public virtual usuario id_usuarioNavigation { get; set; } = null!;
}
